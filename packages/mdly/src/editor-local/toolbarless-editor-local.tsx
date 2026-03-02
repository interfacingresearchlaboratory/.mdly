"use client";

import { useMemo } from "react";
import {
  ToolbarlessEditor,
  type ToolbarlessEditorProps,
} from "../editor/toolbarless-editor";
import { type MentionEntity, type Project, type Task } from "../editor/context/mentions-context";
import { FileLinkContext } from "../editor/context/file-link-context";
import { BacklinksContextProvider, type SameFolderFile } from "./context/backlinks-context";
import { MARKDOWN_TRANSFORMERS_LOCAL } from "./markdown-transformers-local";
import { preprocessMarkdownWikiFileLinks } from "./transformers/markdown-wiki-file-link-transformer";
import { NormalizeWikiFileLinksPlugin } from "./plugins/normalize-wiki-file-links-plugin";
import { BacklinksTypeaheadPlugin } from "./plugins/backlinks-typeahead-plugin";
import { BacklinkTransformPlugin } from "./plugins/backlink-transform-plugin";
import { UnresolvedWikiLinkStylePlugin } from "./plugins/unresolved-wiki-link-style-plugin";
import { nodesLocal } from "./nodes-local";

type ToolbarlessEditorLocalProps = Omit<
  ToolbarlessEditorProps,
  | "entities"
  | "projects"
  | "tasks"
  | "editorNodes"
  | "markdownTransformers"
  | "preprocessInitialMarkdown"
  | "wrapEditor"
  | "renderAdditionalPlugins"
> & {
  entities?: MentionEntity[];
  projects?: Project[] | null;
  tasks?: Task[] | null;
  sameFolderMdFiles?: SameFolderFile[];
  currentFilePath?: string | null;
  onOpenBacklink?: (path: string) => void;
  onFileLinkClick?: (path: string) => void;
};

export function ToolbarlessEditorLocal({
  entities = [],
  projects,
  tasks,
  sameFolderMdFiles = [],
  currentFilePath = null,
  onOpenBacklink,
  onFileLinkClick,
  ...rest
}: ToolbarlessEditorLocalProps) {
  const effectiveMentionEntities = useMemo<MentionEntity[]>(() => {
    if (entities.length > 0) return entities;
    const fromTasks = (tasks ?? []).map((task) => ({
      id: task._id,
      type: "task",
      label: task.title,
    }));
    const fromProjects = (projects ?? []).map((project) => ({
      id: project._id,
      type: "project",
      label: project.title,
    }));
    return [...fromTasks, ...fromProjects];
  }, [entities, projects, tasks]);

  return (
    <ToolbarlessEditor
      {...rest}
      entities={effectiveMentionEntities}
      projects={projects}
      tasks={tasks}
      editorNodes={nodesLocal}
      markdownTransformers={MARKDOWN_TRANSFORMERS_LOCAL}
      preprocessInitialMarkdown={preprocessMarkdownWikiFileLinks}
      wrapEditor={(children) => (
        <BacklinksContextProvider
          sameFolderMdFiles={sameFolderMdFiles}
          currentFilePath={currentFilePath ?? undefined}
          onOpenBacklink={onOpenBacklink ?? undefined}
        >
          <FileLinkContext onFileLinkClick={onFileLinkClick}>
            {children}
          </FileLinkContext>
        </BacklinksContextProvider>
      )}
      renderAdditionalPlugins={({ readOnly }) => (
        <>
          {onFileLinkClick && <NormalizeWikiFileLinksPlugin />}
          {!readOnly && <BacklinksTypeaheadPlugin />}
          {!readOnly && <BacklinkTransformPlugin />}
          <UnresolvedWikiLinkStylePlugin />
        </>
      )}
    />
  );
}
