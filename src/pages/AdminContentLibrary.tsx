import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Copy, Search, Filter, Video, FileText, File } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface SharedLesson {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  content_type: 'video' | 'text' | 'pdf' | 'quiz' | 'document';
  content_url: string;
  duration_minutes: number;
  file_size: number | null;
  file_type: string | null;
  original_filename: string | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function AdminContentLibrary() {
  const { organization } = useOrganization();
  const [lessons, setLessons] = useState<SharedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadSharedLessons();
  }, [organization]);

  const loadSharedLessons = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('shared_lessons')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error loading shared lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSharedLesson = async (id: string) => {
    if (!confirm('Delete this shared lesson from the library?')) return;

    try {
      await supabase.from('shared_lessons').delete().eq('id', id);
      await loadSharedLessons();
    } catch (error) {
      console.error('Error deleting shared lesson:', error);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || lesson.content_type === filterType;
    return matchesSearch && matchesType;
  });

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'document': return <File className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Library</h2>
          <p className="text-gray-400">Manage reusable lesson content for your organization</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add to Library
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="video">Videos</option>
          <option value="pdf">PDFs</option>
          <option value="document">Documents</option>
          <option value="text">Text</option>
        </select>
      </div>

      {filteredLessons.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No shared content yet. Create reusable lessons to speed up course creation.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                  {getContentIcon(lesson.content_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">{lesson.content_type}</p>
                </div>
              </div>

              {lesson.content && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{lesson.content}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{lesson.duration_minutes} min</span>
                {lesson.file_size && (
                  <span>{(lesson.file_size / 1024 / 1024).toFixed(1)} MB</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="w-3 h-3 mr-1" />
                  Use
                </Button>
                <Button variant="outline" size="sm">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="danger" size="sm" onClick={() => deleteSharedLesson(lesson.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
