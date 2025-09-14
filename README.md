# AI-Assisted Project Management Tool

A modern Next.js 15 application for project management with AI assistance, real-time updates, and interactive Gantt charts.

## Features

### Core Functionality
- **Dashboard**: Overview of all projects with progress tracking
- **Project Management**: Detailed project view with task management
- **Task Management**: Create, edit, and organize tasks with dependencies
- **Milestone Tracking**: Mark and track important project milestones
- **Gantt Chart**: Visual timeline representation (static placeholder)

### AI Features
- **Task Suggestions**: AI-powered task details and recommendations
- **Timeline Analysis**: Intelligent timeline adjustments and predictions
- **Project Insights**: AI-generated project analysis and recommendations

### Real-time Features
- **Live Updates**: Mock WebSocket implementation for real-time task updates
- **Collaborative Environment**: Simulated multi-user task updates

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Real-time**: Custom WebSocket simulation
- **AI**: Placeholder functions (ready for integration)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Main navigation bar
│   ├── TaskCard.tsx     # Individual task display
│   ├── TaskForm.tsx     # Task creation/editing form
│   ├── Milestone.tsx    # Milestone component
│   └── GanttChart.tsx   # Gantt chart placeholder
├── lib/
│   ├── types.ts         # TypeScript type definitions
│   ├── data/            # Data management
│   │   └── mockData.ts  # In-memory data store
│   ├── ai/              # AI functionality
│   │   └── placeholders.ts # AI placeholder functions
│   └── realtime.ts      # Real-time update system
├── pages/
│   ├── index.tsx        # Dashboard page
│   └── projects/
│       └── [id].tsx     # Project detail page
└── styles/
    └── globals.css      # Global styles
```

## Key Components

### TaskCard
Displays individual tasks with:
- Status indicators and quick status updates
- Assignee and due date information
- Dependency indicators
- Milestone markers

### TaskForm
Comprehensive task creation/editing with:
- AI-powered suggestions
- Dependency management
- Due date calculation
- Assignee selection

### GanttChart
Static visualization showing:
- Task timelines
- Dependencies (mock)
- Milestone markers
- Progress indicators

## AI Placeholder Functions

### `suggestTaskDetails(input: string)`
Analyzes task title and suggests:
- Detailed description
- Estimated duration
- Recommended assignee
- Priority level
- Dependencies

### `predictTimelineAdjustments(tasks: Task[])`
Analyzes project tasks and provides:
- Timeline risk assessment
- Suggested due date adjustments
- Impact analysis
- Reasoning for recommendations

### `generateProjectInsights(tasks: Task[])`
Provides project-level insights:
- Progress analysis
- Resource allocation suggestions
- Risk identification
- Performance recommendations

## Real-time System

The mock WebSocket service simulates:
- Task creation/updates/deletion events
- Cross-client synchronization
- Notification system
- Event broadcasting

## Data Structure

### Project
```typescript
{
  id: string
  title: string
  description: string
  createdAt: string
  status: 'active' | 'completed' | 'on-hold'
}
```

### Task
```typescript
{
  id: string
  title: string
  description: string
  assignee?: string
  dueDate?: string
  status: 'todo' | 'in-progress' | 'completed'
  dependencies: string[]
  isMilestone: boolean
  parentId?: string
  projectId: string
}
```

## Future Enhancements

1. **Backend Integration**: Replace mock data with real API
2. **AI Integration**: Connect to actual AI services
3. **Real WebSocket**: Implement actual WebSocket server
4. **Interactive Gantt**: Add drag-and-drop functionality
5. **User Authentication**: Add user management
6. **File Attachments**: Support task file uploads
7. **Time Tracking**: Add time logging capabilities
8. **Reporting**: Generate project reports and analytics

## Development Notes

- Uses TypeScript for type safety
- Tailwind CSS for responsive design
- Mock data for development convenience
- Placeholder AI functions for future integration
- Simulated real-time updates for testing

## License

This project is created for demonstration purposes.