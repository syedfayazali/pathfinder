import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useApplications } from "@/hooks/useData";
import { useToast } from "@/components/ui/toast";
import { STATUSES } from "@/lib/constants";
import { CompanyLogo } from "@/components/applications/CompanyLogo";
import { StatusBadge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/types";

export function Pipeline() {
  const { items, loading, upsert } = useApplications();
  const { toast } = useToast();

  const columns = STATUSES.map((s) => ({
    ...s,
    apps: items.filter((a) => a.status === s.value),
  }));

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const app = items.find((a) => a.id === result.draggableId);
    if (!app) return;
    const newStatus = result.destination.droppableId as ApplicationStatus;
    if (app.status !== newStatus) {
      try {
        await upsert({ ...app, status: newStatus });
      } catch {
        toast("Could not update status");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pipeline</h1>
        <p className="mt-1 text-muted-foreground">Drag cards between stages</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.value} className="min-w-[260px] flex-1">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{col.label}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{col.apps.length}</span>
              </div>
              <Droppable droppableId={col.value}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] rounded-xl border border-dashed p-2 transition-colors ${
                      snapshot.isDraggingOver ? "border-primary bg-primary/5" : "border-border bg-card/30"
                    }`}
                  >
                    {col.apps.map((app, index) => (
                      <Draggable key={app.id} draggableId={app.id} index={index}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="mb-2 rounded-lg border border-border bg-card p-3 shadow-sm"
                          >
                            <div className="flex items-start gap-2">
                              <CompanyLogo
                                logoUrl={app.company_logo_url}
                                companyName={app.company_name}
                                size="sm"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium">{app.company_name}</p>
                                <p className="text-xs text-muted-foreground">{app.role_title}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <StatusBadge status={app.status} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {col.apps.length === 0 && (
                      <p className="py-8 text-center text-xs text-muted-foreground">Drop cards here</p>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
