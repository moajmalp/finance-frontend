import { Skeleton } from "../components/ui/Skeleton";

export function GridSkeleton() {
    return (
        <div className="space-y-10 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square w-full rounded-[2.5rem]" />
                ))}
            </div>
        </div>
    );
}
