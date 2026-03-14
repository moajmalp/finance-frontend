import { Skeleton } from "../components/ui/Skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-10 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-12 w-full sm:w-48" />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />
                ))}
            </div>

            {/* Middle Section: Vault + Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Vault Summary */}
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />

                    {/* Liquidity Graph */}
                    <Skeleton className="h-96 w-full rounded-[2.5rem]" />
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}
