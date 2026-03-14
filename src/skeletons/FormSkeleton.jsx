import { Skeleton } from "../components/ui/Skeleton";

export function FormSkeleton() {
    return (
        <div className="max-w-xl mx-auto space-y-10 animate-pulse">
            <div className="flex items-center gap-5">
                <Skeleton className="h-10 w-48" />
            </div>

            <div className="rounded-[2.5rem] p-6 sm:p-10 border border-white/5 space-y-8">
                <div className="flex p-1.5 border border-white/5 rounded-2xl gap-2">
                    <Skeleton className="h-10 w-1/2 rounded-xl" />
                    <Skeleton className="h-10 w-1/2 rounded-xl" />
                </div>

                <div className="space-y-6">
                    <Skeleton className="h-16 w-full rounded-2xl" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Skeleton className="h-14 w-full rounded-2xl" />
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>

                    <Skeleton className="h-32 w-full rounded-3xl border-2 border-dashed border-white/10" />

                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>

                <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
        </div>
    );
}
