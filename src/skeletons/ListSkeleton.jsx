import { Skeleton } from "../components/ui/Skeleton";

export function ListSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header & Search */}
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
