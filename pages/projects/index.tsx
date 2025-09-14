import Link from 'next/link';
import { dataStore } from '@/lib/data/mockData';
import { Project } from '@/lib/types';

interface ProjectsPageProps {
  projects: Project[];
}

export default function ProjectsPage({ projects }: ProjectsPageProps) {
  const getProjectStats = (projectId: string) => {
    const tasks = dataStore.getTasks(projectId);
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const milestones = tasks.filter(t => t.isMilestone).length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;

    return { completed, total, milestones, inProgress };
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-6 text-gray-900">All Projects</h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Manage and monitor all your projects in one place
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </div>
        </div>
      </div>

      {/* Project Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl text-blue-500">📋</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl text-green-500">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl text-blue-500">🏆</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl text-yellow-500">⏸️</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">On Hold</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'on-hold').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate pr-4">
                    {project.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {project.description}
                </p>

                <div className="space-y-4">
                  {/* Progress Bar */}
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

                  {/* Project Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        🏆 {stats.milestones}
                      </span>
                      <span className="flex items-center gap-1">
                        🚧 {stats.inProgress}
                      </span>
                    </div>
                    <span className="text-xs">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status-specific visual indicator */}
              <div className={`h-1 ${
                project.status === 'active' ? 'bg-green-500' :
                project.status === 'completed' ? 'bg-blue-500' :
                'bg-yellow-500'
              }`}></div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Get started by creating your first project
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            Create Project
          </button>
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