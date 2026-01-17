import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold">404 - Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/dashboard" className="mt-4 text-primary hover:underline">
                Return to Dashboard
            </Link>
        </div>
    )
}
