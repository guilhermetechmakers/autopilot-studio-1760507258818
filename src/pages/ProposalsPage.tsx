import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, LayoutTemplate, Plus } from "lucide-react";

import ProposalList from "@/components/ProposalList";
import ProposalEditor from "@/components/ProposalEditor";
import SoWTemplates from "@/components/SoWTemplates";
import type { Proposal } from "@/types";

type ViewMode = "list" | "editor" | "templates";

export default function ProposalsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const handleCreateNew = () => {
    setSelectedProposal(null);
    setViewMode("editor");
  };

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setViewMode("editor");
  };

  const handleViewProposal = () => {
    setViewMode("editor");
  };

  const handleSaveProposal = () => {
    setViewMode("list");
    setSelectedProposal(null);
  };

  const handleCancelEdit = () => {
    setViewMode("list");
    setSelectedProposal(null);
  };

  const handleSelectTemplate = () => {
    setViewMode("editor");
  };

  const handleCreateTemplate = () => {
    setViewMode("templates");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {viewMode === "list" && (
          <ProposalList
            onEdit={handleEditProposal}
            onView={handleViewProposal}
            onCreateNew={handleCreateNew}
          />
        )}

        {viewMode === "editor" && (
          <ProposalEditor
            proposal={selectedProposal || undefined}
            onSave={handleSaveProposal}
            onCancel={handleCancelEdit}
          />
        )}

        {viewMode === "templates" && (
          <SoWTemplates
            onSelectTemplate={handleSelectTemplate}
            onCreateNew={handleCreateTemplate}
          />
        )}

        {/* Navigation Tabs */}
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="shadow-lg">
            <CardContent className="p-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Proposals</span>
                  </TabsTrigger>
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Editor</span>
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4" />
                    <span className="hidden sm:inline">Templates</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
