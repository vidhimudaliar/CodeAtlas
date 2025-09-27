import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database calls
const mockProjects = [
    {
        id: 1,
        name: 'Shellhacks',
        visibility: 'Public',
        lastUpdated: '9/27/2025 10:33 AM'
    },
    {
        id: 2,
        name: 'desi-discipline',
        visibility: 'Public',
        lastUpdated: '4/13/2025 11:49 AM'
    },
    {
        id: 3,
        name: 'DeepVisor',
        visibility: 'Public',
        lastUpdated: '3/5/2025 9:24 PM'
    },
    {
        id: 4,
        name: 'portfolio-website',
        visibility: 'Private',
        lastUpdated: '1/20/2025 5:30 PM'
    },
    {
        id: 4,
        name: 'test-website',
        visibility: 'Private',
        lastUpdated: '9/27/2025 5:30 PM'
    }
];

export async function GET(request: NextRequest) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // For testing different cases, you can modify this:
        // Case 1: Return projects (current)
        // Case 2: Return empty array (no projects)
        // Case 3: Return error (API error)

        return NextResponse.json({
            success: true,
            projects: mockProjects,
            count: mockProjects.length
        });

        // Uncomment these for testing different cases:

        // Case 2: No projects
        // return NextResponse.json({
        //     success: true,
        //     projects: [],
        //     count: 0
        // });

        // Case 3: API Error
        // return NextResponse.json({
        //     success: false,
        //     error: 'Failed to fetch projects'
        // }, { status: 500 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
