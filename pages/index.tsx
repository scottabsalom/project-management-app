import Link from 'next/link';
import { dataStore } from '@/lib/data/mockData';
import { Project } from '@/lib/types';

interface DashboardProps {
  projects: Project[];
}

export default function Dashboard({ projects }: DashboardProps) {
  const getProjectStats = (projectId: string) => {
    const tasks = dataStore.getTasks(projectId);
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const milestones = tasks.filter(t => t.isMilestone).length;

    return { completed, total, milestones };
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Dashboard</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Overview of all your projects and their current status
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{stats.completed}/{stats.total} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      🏆 {stats.milestones} milestones
                    </span>
                    <span>
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500">Get started by creating your first project</p>
        </div>
      )}
    </div>
  );
}

export async function getStaticProps() {
  const projects = dataStore.getProjects();

  return {
    props: {
      projects,
    },
  };
}