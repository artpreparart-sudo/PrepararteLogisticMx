import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  XCircle,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { CourseId, EventItem, RouteId, Salon } from '../types';

const courseOptions: { id: CourseId; label: string; color: string }[] = [
  { id: 'epoxy', label: 'Epoxy', color: 'bg-cyan-500' },
  { id: 'tuning', label: 'Tuning', color: 'bg-green-500' },
  { id: 'globo', label: 'Globo', color: 'bg-orange-500' },
  { id: 'maquillaje', label: 'Maquillaje', color: 'bg-pink-500' },
];

const routeOptions: { id: RouteId; label: string; gradient: string }[] = [
  { id: 'ruta1', label: 'Ruta 1', gradient: 'from-pink-400 to-purple-500' },
  { id: 'ruta2', label: 'Ruta 2', gradient: 'from-cyan-300 to-sky-500' },
  { id: 'ruta3', label: 'Ruta 3', gradient: 'from-violet-500 to-blue-600' },
];

const weekdayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getMonthMatrix(monthStart: Date) {
  const firstDay = new Date(monthStart);
  const startWeekDay = (firstDay.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

  const matrix: { day: number; iso: string }[] = [];
  for (let i = 0; i < startWeekDay; i++) {
    matrix.push({ day: 0, iso: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toISODate(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));
    matrix.push({ day: d, iso });
  }
  return matrix;
}

interface EventsCalendarScreenProps {
  onOpenSalon: (salon: Salon) => void;
}

export const EventsCalendarScreen: React.FC<EventsCalendarScreenProps> = ({ onOpenSalon }) => {
  const { states, salones, events, addEvent, updateEvent, deleteEvent } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [selectedCourses, setSelectedCourses] = useState<Set<CourseId>>(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState<Set<RouteId>>(new Set(['ruta1']));
  const [stateId, setStateId] = useState<string>(states[0]?.id ?? '');
  const [city, setCity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visibleStartMonth, setVisibleStartMonth] = useState<Date>(startOfMonth(new Date()));
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'route'>('all');
  const [routeFilter, setRouteFilter] = useState<RouteId>('ruta1');

  const currentState = states.find((s) => s.id === stateId) || null;

  const eventsByDay = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const selectedDayEvents = focusedDate ? eventsByDay[focusedDate] || [] : [];

  const toggleCourse = (id: CourseId) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRoute = (id: RouteId) => {
    setSelectedRoutes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetForm = () => {
    setSelectedCourses(new Set());
    setSelectedRoutes(new Set(['ruta1']));
    setCity('');
    setNotes('');
    setEditingId(null);
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!stateId) {
      alert('Selecciona un estado');
      return;
    }
    if (!city.trim()) {
      alert('Ingresa la ciudad');
      return;
    }
    if (selectedCourses.size === 0) {
      alert('Selecciona al menos un curso');
      return;
    }
    if (selectedRoutes.size === 0) {
      alert('Selecciona al menos una ruta');
      return;
    }

    const base: EventItem = {
      id: editingId ?? `event-${Date.now()}`,
      date: selectedDate,
      stateId,
      stateName: currentState?.name ?? 'Estado',
      city: city.trim(),
      routes: Array.from(selectedRoutes),
      courses: Array.from(selectedCourses),
      courseSalons: Array.from(selectedCourses).map((c) => ({ course: c, salonId: null })),
      cancelledCourses: [],
      status: 'active',
      notes: notes.trim() || undefined,
      createdAt: editingId ? events.find((ev) => ev.id === editingId)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateEvent(editingId, base);
    } else {
      addEvent(base);
    }

    resetForm();
  };

  const handleSelectDay = (iso: string) => {
    setFocusedDate(iso);
  };

  const setEditFromEvent = (ev: EventItem) => {
    setEditingId(ev.id);
    setSelectedDate(ev.date);
    setStateId(ev.stateId);
    setCity(ev.city);
    setNotes(ev.notes || '');
    setSelectedCourses(new Set(ev.courses));
    setSelectedRoutes(new Set(ev.routes));
  };

  const updateCourseSalon = (eventId: string, course: CourseId, salonId: string | null) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    const courseSalons = ev.courseSalons.map((cs) =>
      cs.course === course ? { ...cs, salonId } : cs
    );
    updateEvent(eventId, { courseSalons });
  };

  const toggleCancelCourse = (eventId: string, course: CourseId) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    const cancelled = new Set(ev.cancelledCourses);
    if (cancelled.has(course)) cancelled.delete(course);
    else cancelled.add(course);
    updateEvent(eventId, { cancelledCourses: Array.from(cancelled) });
  };

  const toggleCancelEvent = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    const status = ev.status === 'cancelled' ? 'active' : 'cancelled';
    updateEvent(eventId, { status });
  };

  const monthCards = useMemo(() => {
    return Array.from({ length: 4 }).map((_, idx) => startOfMonth(addMonths(visibleStartMonth, idx)));
  }, [visibleStartMonth]);

  const getDayStatus = (iso: string, routeId: RouteId) => {
    const evs = eventsByDay[iso]?.filter((ev) => ev.routes.includes(routeId)) || [];
    if (evs.some((ev) => ev.status === 'cancelled')) return 'cancelled';
    if (evs.length > 0) return 'busy';
    return 'free';
  };

  const courseColor = (course: CourseId) => courseOptions.find((c) => c.id === course)?.color || 'bg-gray-500';

  const routeGradient = (route: RouteId) => routeOptions.find((r) => r.id === route)?.gradient || 'from-gray-500 to-gray-600';

  const salonsForEvent = (ev: EventItem) => {
    const stateName = ev.stateName.trim().toLowerCase();
    const cityName = ev.city.trim().toLowerCase();
    return salones.filter(
      (s) => s.state.trim().toLowerCase() === stateName && s.city.trim().toLowerCase() === cityName
    );
  };

  const visibleRoutes = viewMode === 'all' ? routeOptions : routeOptions.filter((r) => r.id === routeFilter);

  const findSalonById = (salonId: string | null) => salones.find((s) => s.id === salonId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel izquierdo: crear/editar evento */}
        <form onSubmit={handleSubmit} className="card p-4 w-full lg:w-96 space-y-4 bg-dark-900 border border-dark-700">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Nueva fecha</h2>
          </div>

          <div>
            <label className="text-sm text-gray-400">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Cursos (multi)</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {courseOptions.map((course) => {
                const active = selectedCourses.has(course.id);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${
                      active
                        ? `${course.color} text-white border-transparent`
                        : 'bg-dark-800 text-gray-300 border-dark-600 hover:border-purple-500'
                    }`}
                  >
                    {course.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Rutas (multi)</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {routeOptions.map((route) => {
                const active = selectedRoutes.has(route.id);
                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => toggleRoute(route.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition bg-gradient-to-r ${route.gradient} ${
                      active ? 'text-white shadow-lg border-transparent' : 'text-white/80 border-white/20 opacity-80'
                    }`}
                  >
                    {route.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Estado</label>
            <select
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              className="input-field mt-1"
            >
              {states
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Ciudad</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej. Puebla"
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field mt-1"
              placeholder="Detalles del evento"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              {editingId ? 'Actualizar' : 'Agregar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        {/* Calendarios por ruta y mes */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Calendario de eventos</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('route')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border ${
                    viewMode === 'route'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-dark-900 text-gray-300 border-dark-700 hover:border-purple-500'
                  }`}
                >
                  Vista por ruta y mes
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border ${
                    viewMode === 'all'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-dark-900 text-gray-300 border-dark-700 hover:border-purple-500'
                  }`}
                >
                  Vista todos
                </button>
              </div>
              {viewMode === 'route' && (
                <select
                  value={routeFilter}
                  onChange={(e) => setRouteFilter(e.target.value as RouteId)}
                  className="input-field text-xs w-40"
                >
                  {routeOptions.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setVisibleStartMonth(addMonths(visibleStartMonth, -4))}
                className="p-2 rounded-lg bg-dark-800 border border-dark-700 hover:bg-dark-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVisibleStartMonth(addMonths(visibleStartMonth, 4))}
                className="p-2 rounded-lg bg-dark-800 border border-dark-700 hover:bg-dark-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthCards.map((monthStart) => {
              const matrix = getMonthMatrix(monthStart);
              return (
                <div key={monthStart.toISOString()} className="card p-3 bg-dark-900/80 border border-dark-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-400">{monthStart.getFullYear()}</p>
                      <h3 className="text-lg font-bold text-white">{monthNames[monthStart.getMonth()]}</h3>
                    </div>
                  </div>

                  {visibleRoutes.map((route) => (
                    <div key={route.id} className="mb-3 last:mb-0">
                      <div className={`text-xs font-semibold text-white px-2 py-1 rounded bg-gradient-to-r ${route.gradient} inline-block mb-2`}>
                        {route.label}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                        {weekdayNames.map((wd) => (
                          <span key={wd}>{wd}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {matrix.map((cell, idx) => {
                          if (cell.day === 0) return <div key={idx} className="py-2" />;
                          const status = getDayStatus(cell.iso, route.id);
                          const isFocused = focusedDate === cell.iso;
                          const baseClasses = 'py-1.5 rounded-lg cursor-pointer transition border';
                          let colorClasses = 'text-gray-200 bg-dark-800 border-dark-700 hover:border-purple-500';
                          if (status === 'busy') {
                            colorClasses = `text-white bg-gradient-to-r ${route.gradient} border-transparent`;
                          }
                          if (status === 'cancelled') {
                            colorClasses = 'text-red-200 bg-red-900/40 border-red-500';
                          }
                          if (isFocused) {
                            colorClasses += ' ring-2 ring-purple-400/60';
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectDay(cell.iso)}
                              className={`${baseClasses} ${colorClasses}`}
                            >
                              {cell.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      <div className="card p-4 bg-dark-900 border border-dark-700">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Detalle del día</h3>
          <span className="text-gray-400 text-sm">{focusedDate || 'Selecciona una fecha'}</span>
        </div>

        {focusedDate && selectedDayEvents.length === 0 && (
          <div className="text-gray-400">Sin eventos para este día.</div>
        )}

        {selectedDayEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDayEvents.map((ev) => {
              const courseSalonsMap = Object.fromEntries(ev.courseSalons.map((c) => [c.course, c.salonId]));
              const availableSalons = salonsForEvent(ev);
              return (
                <div key={ev.id} className="border border-dark-700 rounded-lg p-3 bg-dark-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-200 font-semibold">{ev.city}</p>
                      <p className="text-sm text-gray-300">{ev.stateName}</p>
                      <h4 className="text-white font-semibold mt-1">{monthNames[new Date(ev.date).getMonth()]} {new Date(ev.date).getDate()}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditFromEvent(ev)}
                        className="px-3 py-1 rounded bg-blue-600/70 text-white text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="px-3 py-1 rounded bg-red-600/70 text-white text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ev.routes.map((r) => (
                      <span key={r} className={`px-2 py-1 rounded text-xs text-white bg-gradient-to-r ${routeGradient(r)}`}>
                        {routeOptions.find((ro) => ro.id === r)?.label || r}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Cursos</p>
                    <div className="flex flex-wrap gap-2">
                      {ev.courses.map((c) => {
                        const cancelled = ev.cancelledCourses.includes(c);
                        return (
                          <div
                            key={c}
                            className={`px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-2 ${courseColor(c)}`}
                          >
                            <span className={cancelled ? 'line-through' : ''}>{courseOptions.find((co) => co.id === c)?.label || c}</span>
                            <button
                              onClick={() => toggleCancelCourse(ev.id, c)}
                              className="bg-black/20 rounded-full p-1 hover:bg-black/40"
                              title={cancelled ? 'Reactivar curso' : 'Cancelar curso'}
                            >
                              {cancelled ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Salones por curso</p>
                    {availableSalons.length === 0 && (
                      <div className="text-xs text-red-300 bg-red-900/30 border border-red-700 rounded px-3 py-2">
                        No hay salones en la agenda para {ev.city}, {ev.stateName}.
                      </div>
                    )}
                    {ev.courses.map((c) => (
                      <div key={c} className="flex flex-col gap-1 border border-dark-700 rounded-lg p-2 bg-dark-900/50">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${courseColor(c)}`} />
                          <span className="text-sm text-gray-200">{courseOptions.find((co) => co.id === c)?.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={courseSalonsMap[c] || ''}
                            onChange={(e) => updateCourseSalon(ev.id, c, e.target.value || null)}
                            className="flex-1 input-field"
                            disabled={availableSalons.length === 0}
                          >
                            <option value="">{availableSalons.length === 0 ? 'Sin salones disponibles' : 'Agregar salón'}</option>
                            {availableSalons.map((salon) => (
                              <option key={salon.id} value={salon.id}>{salon.hotelName}</option>
                            ))}
                          </select>
                          {courseSalonsMap[c] && findSalonById(courseSalonsMap[c]) && (
                            <button
                              onClick={() => {
                                const salon = findSalonById(courseSalonsMap[c]);
                                if (salon) onOpenSalon(salon);
                              }}
                              className="px-2 py-1 text-xs bg-dark-700 rounded text-white hover:bg-purple-600"
                            >
                              Ver salón
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCancelEvent(ev.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                        ev.status === 'cancelled'
                          ? 'bg-green-600/70 text-white'
                          : 'bg-red-600/70 text-white'
                      }`}
                    >
                      {ev.status === 'cancelled' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Reactivar fecha
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Cancelar fecha
                        </>
                      )}
                    </button>
                  </div>

                  {ev.notes && <p className="text-xs text-gray-300">{ev.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
