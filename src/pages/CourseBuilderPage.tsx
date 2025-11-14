import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, ChevronLeft, Link as LinkIcon } from 'lucide-react';
import { supabase, Module, Lesson } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { uploadFile, deleteFile, UploadProgress } from '../lib/storage';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FileUploader } from '../components/FileUploader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

interface CourseBuilderPageProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

export function CourseBuilderPage({ courseId, courseName, onBack }: CourseBuilderPageProps) {
  const { organization } = useOrganization();
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson?: Lesson } | null>(null);
  const { confirm, confirmState } = useConfirm();
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    loadCourseStructure();
  }, [courseId]);

  const loadCourseStructure = async () => {
    try {
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (!modulesData) return;

      const modulesWithLessons = await Promise.all(
        modulesData.map(async (module) => {
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index');

          return {
            ...module,
            lessons: lessonsData || [],
          };
        })
      );

      setModules(modulesWithLessons);
    } catch (error) {
      console.error('Error loading course structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteModule = async (moduleId: string, moduleTitle: string) => {
    const confirmed = await confirm({
      title: 'Delete Module',
      message: `Are you sure you want to delete "${moduleTitle}" and all its lessons? This action cannot be undone.`,
      confirmLabel: 'Delete Module',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await supabase.from('modules').delete().eq('id', moduleId);
      await loadCourseStructure();
      success('Module deleted successfully');
    } catch (err) {
      console.error('Error deleting module:', err);
      error('Failed to delete module');
    }
  };

  const deleteLesson = async (lessonId: string, lessonTitle: string) => {
    const confirmed = await confirm({
      title: 'Delete Lesson',
      message: `Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`,
      confirmLabel: 'Delete Lesson',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('content_url')
        .eq('id', lessonId)
        .single();

      if (lesson?.content_url) {
        try {
          await deleteFile(lesson.content_url);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }

      await supabase.from('lessons').delete().eq('id', lessonId);
      await loadCourseStructure();
      success('Lesson deleted successfully');
    } catch (err) {
      console.error('Error deleting lesson:', err);
      error('Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Course Builder</h1>
              <p className="text-sm text-gray-400">{courseName}</p>
            </div>
          </div>
          <Button onClick={() => setShowAddModule(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {modules.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No modules yet. Start building your course!</p>
              <Button onClick={() => setShowAddModule(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Module
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {modules.map((module, moduleIndex) => (
              <Card key={module.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="w-5 h-5 text-gray-500 mt-1 cursor-move" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-gray-400 text-sm">{module.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLesson({ moduleId: module.id })}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Lesson
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteModule(module.id, module.title)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {module.lessons.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-3">No lessons in this module</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLesson({ moduleId: module.id })}
                    >
                      Add First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span>{lesson.content_type}</span>
                            <span>{lesson.duration_minutes} min</span>
                            {lesson.original_filename && (
                              <span className="truncate max-w-xs" title={lesson.original_filename}>
                                {lesson.original_filename}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingLesson({ moduleId: module.id, lesson })}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteLesson(lesson.id, lesson.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {showAddModule && (
        <ModuleModal
          courseId={courseId}
          organizationId={organization?.id}
          onClose={() => setShowAddModule(false)}
          onSave={() => {
            setShowAddModule(false);
            loadCourseStructure();
            success('Module created successfully');
          }}
        />
      )}

      {editingLesson && (
        <LessonModal
          moduleId={editingLesson.moduleId}
          organizationId={organization?.id}
          lesson={editingLesson.lesson}
          onClose={() => setEditingLesson(null)}
          onSave={() => {
            setEditingLesson(null);
            loadCourseStructure();
            success(editingLesson.lesson ? 'Lesson updated successfully' : 'Lesson created successfully');
          }}
          onError={(message: string) => error(message)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function ModuleModal({
  courseId,
  organizationId,
  onClose,
  onSave,
}: {
  courseId: string;
  organizationId?: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existingModules } = await supabase
        .from('modules')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = existingModules && existingModules.length > 0
        ? existingModules[0].order_index + 1
        : 0;

      await supabase.from('modules').insert({
        course_id: courseId,
        organization_id: organizationId,
        title,
        description,
        order_index: nextOrderIndex,
      });

      onSave();
    } catch (error) {
      console.error('Error creating module:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Add New Module</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Module Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to React"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this module"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Module'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LessonModal({
  moduleId,
  organizationId,
  lesson,
  onClose,
  onSave,
  onError,
}: {
  moduleId: string;
  organizationId?: string;
  lesson?: Lesson;
  onClose: () => void;
  onSave: () => void;
  onError: (message: string) => void;
}) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [content, setContent] = useState(lesson?.content || '');
  const [contentType, setContentType] = useState<Lesson['content_type']>(lesson?.content_type || 'video');
  const [contentUrl, setContentUrl] = useState(lesson?.content_url || '');
  const [duration, setDuration] = useState(lesson?.duration_minutes || 10);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileMetadata, setFileMetadata] = useState<{
    size: number | null;
    type: string | null;
    filename: string | null;
  }>({
    size: lesson?.file_size || null,
    type: lesson?.file_type || null,
    filename: lesson?.original_filename || null,
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setContentUrl('');
    setFileMetadata({
      size: null,
      type: null,
      filename: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalContentUrl = contentUrl;
      let finalFileSize = fileMetadata.size;
      let finalFileType = fileMetadata.type;
      let finalFilename = fileMetadata.filename;

      if (uploadMode === 'file' && selectedFile) {
        setUploading(true);

        if (lesson?.content_url && uploadMode === 'file') {
          try {
            await deleteFile(lesson.content_url);
          } catch (error) {
            console.error('Error deleting old file:', error);
          }
        }

        const uploadResult = await uploadFile(selectedFile, (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
        });

        finalContentUrl = uploadResult.url;
        finalFileSize = uploadResult.size;
        finalFileType = uploadResult.type;
        finalFilename = uploadResult.originalFilename;
        setUploading(false);
      }

      if (lesson) {
        await supabase
          .from('lessons')
          .update({
            title,
            content,
            content_type: contentType,
            content_url: finalContentUrl,
            duration_minutes: duration,
            file_size: finalFileSize,
            file_type: finalFileType,
            original_filename: finalFilename,
          })
          .eq('id', lesson.id);
      } else {
        const { data: existingLessons } = await supabase
          .from('lessons')
          .select('order_index')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrderIndex = existingLessons && existingLessons.length > 0
          ? existingLessons[0].order_index + 1
          : 0;

        await supabase.from('lessons').insert({
          module_id: moduleId,
          organization_id: organizationId,
          title,
          content,
          content_type: contentType,
          content_url: finalContentUrl,
          duration_minutes: duration,
          order_index: nextOrderIndex,
          file_size: finalFileSize,
          file_type: finalFileType,
          original_filename: finalFilename,
        });
      }

      onSave();
    } catch (err) {
      console.error('Error saving lesson:', err);
      onError('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-700 my-8">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {lesson ? 'Edit Lesson' : 'Add New Lesson'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Lesson Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Understanding React Components"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as Lesson['content_type'])}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="video">Video</option>
              <option value="text">Text/Article</option>
              <option value="pdf">PDF Document</option>
              <option value="quiz">Quiz</option>
              <option value="document">Document</option>
            </select>
          </div>

          {(contentType === 'video' || contentType === 'pdf' || contentType === 'document') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  {contentType === 'video' ? 'Video' : contentType === 'pdf' ? 'PDF' : 'Document'} Content
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      uploadMode === 'file'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      uploadMode === 'url'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3 inline mr-1" />
                    Use URL
                  </button>
                </div>
              </div>

              {uploadMode === 'file' ? (
                <FileUploader
                  fileType={contentType === 'video' ? 'video' : contentType === 'pdf' ? 'document' : 'document'}
                  onFileSelect={handleFileSelect}
                  currentFileUrl={contentUrl}
                  currentFileName={fileMetadata.filename}
                  onRemove={handleRemoveFile}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                />
              ) : (
                <Input
                  label=""
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  helperText="Enter the URL to your file"
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Lesson Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter lesson description, notes, or text content"
              rows={6}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="1"
            required
          />

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? 'Uploading...' : loading ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
