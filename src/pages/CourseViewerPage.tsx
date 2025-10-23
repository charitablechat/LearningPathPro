import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen, Clock, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Module, Lesson, LessonProgress } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { VideoPlayer } from '../components/VideoPlayer';
import { ProgressRing } from '../components/ProgressRing';

interface ModuleWithLessons extends Module {
  lessons: LessonWithProgress[];
}

interface LessonWithProgress extends Lesson {
  progress?: LessonProgress;
}

interface CourseViewerPageProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

export function CourseViewerPage({ courseId, courseName, onBack }: CourseViewerPageProps) {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    loadCourseContent();
  }, [courseId, user]);

  const loadCourseContent = async () => {
    if (!user) return;

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

          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', lessonsData?.map((l) => l.id) || []);

          const lessonsWithProgress = lessonsData?.map((lesson) => ({
            ...lesson,
            progress: progressData?.find((p) => p.lesson_id === lesson.id),
          })) || [];

          return {
            ...module,
            lessons: lessonsWithProgress,
          };
        })
      );

      setModules(modulesWithLessons);

      const allLessons = modulesWithLessons.flatMap((m) => m.lessons);
      const completedLessons = allLessons.filter((l) => l.progress?.is_completed).length;
      const progress = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0;
      setOverallProgress(progress);

      if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
        const firstIncompleteLesson = allLessons.find((l) => !l.progress?.is_completed);
        setCurrentLesson(firstIncompleteLesson || allLessons[0]);
      }
    } catch (error) {
      console.error('Error loading course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('lesson_progress')
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('lesson_progress').insert({
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          time_spent_minutes: 0,
        });
      }

      await loadCourseContent();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const goToNextLesson = () => {
    if (!currentLesson) return;

    const allLessons = modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);

    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    if (!currentLesson) return;

    const allLessons = modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);

    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = currentLesson ? allLessons.findIndex((l) => l.id === currentLesson.id) : -1;
  const isFirstLesson = currentIndex === 0;
  const isLastLesson = currentIndex === allLessons.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">{courseName}</h1>
              <p className="text-sm text-gray-400">{currentLesson?.title || 'Select a lesson'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-400">Course Progress</p>
              <p className="text-lg font-semibold text-white">{Math.round(overallProgress)}%</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? 'Hide' : 'Show'} Lessons
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            {currentLesson ? (
              <div className="space-y-6">
                {currentLesson.content_type === 'video' && currentLesson.content_url && (
                  <VideoPlayer
                    videoUrl={currentLesson.content_url}
                    onComplete={() => markLessonComplete(currentLesson.id)}
                  />
                )}

                {currentLesson.content_type === 'text' && (
                  <Card>
                    <div className="prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content || '' }} />
                    </div>
                  </Card>
                )}

                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {currentLesson.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {currentLesson.content_type}
                        </span>
                      </div>
                    </div>
                    {!currentLesson.progress?.is_completed && (
                      <Button onClick={() => markLessonComplete(currentLesson.id)}>
                        Mark as Complete
                      </Button>
                    )}
                  </div>

                  {currentLesson.content && currentLesson.content_type !== 'text' && (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300">{currentLesson.content}</p>
                    </div>
                  )}
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousLesson}
                    disabled={isFirstLesson}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous Lesson
                  </Button>
                  <Button
                    onClick={goToNextLesson}
                    disabled={isLastLesson}
                  >
                    Next Lesson
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No lessons available yet</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {showSidebar && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-center mb-4">
                <ProgressRing progress={overallProgress} size={100} />
              </div>
              <p className="text-center text-gray-400 text-sm">
                {allLessons.filter((l) => l.progress?.is_completed).length} of {allLessons.length} lessons completed
              </p>
            </div>

            <div className="p-4 space-y-4">
              {modules.map((module, moduleIndex) => (
                <div key={module.id}>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-gray-500">Module {moduleIndex + 1}</span>
                    {module.title}
                  </h3>
                  <div className="space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentLesson?.id === lesson.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {lesson.progress?.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            <p className="text-xs text-gray-400">{lesson.duration_minutes} min</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
