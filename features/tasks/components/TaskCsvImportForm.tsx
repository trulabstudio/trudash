"use client";

import { useActionState, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import type { Project } from "@/features/projects/types/project.type";
import { importTasksCsvAction, type TaskActionState } from "@/features/tasks/actions/task.action";

type CsvRow = {
  taskName: string;
  description?: string;
  dueDate?: string;
  status: "todo" | "in_progress" | "completed" | "blocked";
  finalLink?: string;
  internalNotes?: string;
  assignedToEmail?: string;
};

type TaskCsvImportFormProps = {
  projects: Project[];
};

const initialState: TaskActionState = {};
const requiredHeaders = ["task_name"];
const optionalHeaders = ["description", "due_date", "status", "final_link", "internal_notes", "assigned_to_email"];
const sampleCsv = `task_name,description,due_date,status,final_link,internal_notes,assigned_to_email
Homepage QA,Review responsive homepage,2026-07-01,todo,,,team@example.com
Final review,Confirm delivery link,2026-07-05,completed,https://example.com/final,,`;

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === "\"" && quoted && nextCharacter === "\"") {
      current += "\"";
      index += 1;
    } else if (character === "\"") {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function normalizeStatus(value: string): CsvRow["status"] {
  const status = value.trim().toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");

  if (status === "in_progress" || status === "completed" || status === "blocked") {
    return status;
  }

  return "todo";
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV needs a header row and at least one task row.");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required column: ${missingHeaders.join(", ")}`);
  }

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));

    return {
      taskName: row.task_name,
      description: row.description,
      dueDate: row.due_date,
      status: normalizeStatus(row.status ?? ""),
      finalLink: row.final_link,
      internalNotes: row.internal_notes,
      assignedToEmail: row.assigned_to_email
    };
  });
}

export function TaskCsvImportForm({ projects }: TaskCsvImportFormProps) {
  const [state, action, isPending] = useActionState(importTasksCsvAction, initialState);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const { register } = useForm<{ projectId: string }>();
  const csvRowsValue = useMemo(() => JSON.stringify(rows), [rows]);

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Import Tasks from CSV</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Select one project, upload a CSV, and each valid row will be created as a task.
          </p>
        </div>
        <span className="rounded-sm border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          Max 100 rows
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="csvProjectId">Project</Label>
          <select
            id="csvProjectId"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("projectId")}
            required
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="taskCsv">CSV File</Label>
          <input
            id="taskCsv"
            type="file"
            accept=".csv,text/csv"
            className="block h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-sm file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium file:text-foreground"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              setRows([]);
              setParseError(null);

              if (!file) {
                return;
              }

              try {
                setRows(parseCsv(await file.text()));
              } catch (error) {
                setParseError(error instanceof Error ? error.message : "CSV could not be parsed.");
              }
            }}
            required
          />
        </div>
      </div>

      <input type="hidden" name="csvRows" value={csvRowsValue} />

      <div className="mt-5 rounded-md border border-border bg-muted p-4">
        <p className="text-sm font-semibold text-foreground">CSV columns</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Required: {requiredHeaders.join(", ")}. Optional: {optionalHeaders.join(", ")}. Status values:
          todo, in_progress, completed, blocked.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-sm bg-surface p-3 text-xs text-muted-foreground">{sampleCsv}</pre>
      </div>

      {rows.length > 0 ? (
        <p className="mt-4 text-sm text-primary">{rows.length} task rows ready to import.</p>
      ) : null}
      {parseError ? <p className="mt-4 text-sm text-destructive">{parseError}</p> : null}
      {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}

      <Button type="submit" className="mt-5" disabled={isPending || projects.length === 0 || rows.length === 0}>
        {isPending ? "Importing" : "Import Tasks"}
      </Button>
    </form>
  );
}
