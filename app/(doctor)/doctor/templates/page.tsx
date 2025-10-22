"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { TemplateBrowser } from "@/components/features/doctor/templates/template-browser";
import { NOTE_TEMPLATES, type NoteTemplate } from "@/components/features/doctor/templates/mock-data";
import { NoteEditor } from "@/components/features/doctor/templates/note-editor";

export default function DoctorTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(null);
  const [drafts, setDrafts] = useState<
    Array<{ templateId: string; content: NoteTemplate["content"] }>
  >([]);

  const templates = useMemo(() => NOTE_TEMPLATES, []);

  return (
    <>
      <PageShell
        title="Template Catatan Klinis"
        subtitle={`Kuratkan catatan sesi dengan template spesialis, siap pakai${
          drafts.length ? ` • ${drafts.length} draft tersimpan` : ""
        }.`}
      >
        <TemplateBrowser templates={templates} onSelect={setSelectedTemplate} />
      </PageShell>

      <NoteEditor
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onSaveDraft={(template, content) =>
          setDrafts((prev) => [
            ...prev.filter((draft) => draft.templateId !== template.id),
            { templateId: template.id, content: content as NoteTemplate["content"] },
          ])
        }
      />
    </>
  );
}
