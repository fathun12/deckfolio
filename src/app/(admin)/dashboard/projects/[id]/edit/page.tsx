import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getEditorProject } from "@/server/services/editor.service";
import { getProjectSettings } from "@/server/services/project-settings.service";
import { getSlideBlocks } from "@/server/services/slide-blocks.service";
import {
  addSectionAction,
  addSlideAction,
  deleteSectionAction,
  deleteSlideAction,
  moveSlideAction,
  renameSectionAction,
  renameSlideAction,
  reorderSectionsAction,
  reorderSlidesAction,
} from "@/server/actions/editor.actions";
import {
  saveProjectSettingsAction,
  setProjectVisibilityAction,
} from "@/server/actions/project-settings.actions";
import { saveSlideBlocksAction } from "@/server/actions/slide-blocks.actions";
import { EditorShell } from "@/features/editor/ui/EditorShell";

export const metadata = { title: "Editor" };

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getEditorProject(id);
  if (!project) notFound();

  const [blocks, settings] = await Promise.all([
    getSlideBlocks(project.id),
    getProjectSettings(project.id),
  ]);
  if (!settings) notFound();

  return (
    <EditorShell
      projectId={project.id}
      ownerId={user.id}
      initialSettings={settings}
      initialVisibility={project.visibility}
      initial={{ sections: project.sections, slides: project.slides }}
      initialBlocks={blocks}
      actions={{
        addSlide: addSlideAction,
        renameSlide: renameSlideAction,
        deleteSlide: deleteSlideAction,
        moveSlide: moveSlideAction,
        reorderSlides: reorderSlidesAction,
        addSection: addSectionAction,
        renameSection: renameSectionAction,
        deleteSection: deleteSectionAction,
        reorderSections: reorderSectionsAction,
      }}
      saveBlocks={saveSlideBlocksAction}
      saveSettings={saveProjectSettingsAction}
      setVisibility={setProjectVisibilityAction}
    />
  );
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="label-mono p-8 text-muted">Loading editor...</p>}>
      <Editor params={params} />
    </Suspense>
  );
}