import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  FileText, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import { proposalsApi } from "@/api/proposals";
import type { Proposal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface ProposalListProps {
  onEdit?: (proposal: Proposal) => void;
  onView?: (proposal: Proposal) => void;
  onCreateNew?: () => void;
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: FileText },
  sent: { label: "Sent", variant: "default" as const, icon: Send },
  signed: { label: "Signed", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

const ProposalList: React.FC<ProposalListProps> = ({ 
  onEdit, 
  onView, 
  onCreateNew 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch proposals
  const { data: proposalsData, isLoading, error } = useQuery({
    queryKey: ["proposals", { page, search: searchTerm, status: statusFilter }],
    queryFn: () => proposalsApi.getProposals({
      page,
      limit: 10,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }),
  });

  // Delete proposal mutation
  const deleteProposalMutation = useMutation({
    mutationFn: proposalsApi.deleteProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete proposal");
      console.error("Delete error:", error);
    },
  });

  // Send for signature mutation
  const sendForSignatureMutation = useMutation({
    mutationFn: ({ proposalId, data }: { proposalId: string; data: any }) =>
      proposalsApi.sendForSignature(proposalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal sent for signature");
    },
    onError: (error) => {
      toast.error("Failed to send proposal");
      console.error("Send error:", error);
    },
  });

  const handleDelete = (proposal: Proposal) => {
    if (window.confirm(`Are you sure you want to delete "${proposal.title}"?`)) {
      deleteProposalMutation.mutate(proposal.id);
    }
  };

  const handleSendForSignature = (proposal: Proposal) => {
    const email = prompt("Enter signer email:");
    const name = prompt("Enter signer name:");
    
    if (email && name) {
      sendForSignatureMutation.mutate({
        proposalId: proposal.id,
        data: { signer_email: email, signer_name: name, expires_in_days: 7 }
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  if (error) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Proposals</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the proposals. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Proposals & SoW</h2>
          <p className="text-muted-foreground">
            Manage your project proposals and statements of work
          </p>
        </div>
        <Button onClick={onCreateNew} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="signed">Signed</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Table */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposals
            {proposalsData && (
              <Badge variant="secondary" className="ml-2">
                {proposalsData.count}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : !proposalsData?.data.length ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Proposals Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No proposals match your current filters."
                  : "Get started by creating your first proposal."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={onCreateNew} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Proposal
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposalsData.data.map((proposal) => {
                  const statusInfo = getStatusConfig(proposal.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow 
                      key={proposal.id} 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onView?.(proposal)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{proposal.title}</div>
                            {proposal.ai_generated && (
                              <Badge variant="outline" className="text-xs">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          Client ID: {proposal.client_id}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(proposal.value)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(proposal.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{proposal.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView?.(proposal)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(proposal)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {proposal.status === "draft" && (
                              <DropdownMenuItem 
                                onClick={() => handleSendForSignature(proposal)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send for Signature
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(proposal)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {proposalsData && proposalsData.count > 10 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(proposalsData.count / 10)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(proposalsData.count / 10)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalList;
