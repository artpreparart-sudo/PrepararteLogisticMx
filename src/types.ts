export interface Salon {
  id: string;
  hotelName: string;
  state: string;
  city: string;
  owner: string;
  contact: string;
  address: string;
  locationUrl: string;
  numSalones: number;
  salones: SalonDetail[];
  images: string[];
  comments?: string;
  rating?: SalonRating;
  bankingData?: BankingData;
  createdAt: string;
  updatedAt: string;
}

export type CourseId = 'epoxy' | 'tuning' | 'globo' | 'maquillaje';
export type RouteId = 'ruta1' | 'ruta2' | 'ruta3';

export interface EventCourseSalon {
  course: CourseId;
  salonId: string | null;
}

export interface EventItem {
  id: string;
  date: string; // ISO YYYY-MM-DD
  stateId: string;
  stateName: string;
  city: string;
  routes: RouteId[];
  courses: CourseId[];
  courseSalons: EventCourseSalon[];
  cancelledCourses: CourseId[];
  status: 'active' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalonDetail {
  id: string;
  nombre: string;
  capacidadHerradura: number;
  altura: number;
  precio: number;
  cursos: string[];
}

export interface SalonRating {
  cursoIndicado: string[];
  esCentrico: boolean;
  tieneEstacionamiento: boolean;
  estacionamientoTechado: boolean;
  banosLimpios: boolean;
  limpiezaEntradaSalida: boolean;
  buenaIluminacion: boolean;
  contactosCerca: boolean;
  descripcion: string;
}

export interface BankingData {
  ciudad: string;
  cursos: string;
  nombreSalon: string;
  beneficiario: string;
  cuenta: string;
  banco: string;
  monto: number;
  pago: 'completo' | '50%' | 'evento' | 'salon-voleto' | 'diferido';
  concepto?: string;
}

export interface State {
  id: string;
  name: string;
  gradient: string;
  backgroundImage?: string; // Imagen de fondo editable
}

export interface City {
  id: string;
  stateId: string;
  name: string;
  coverImage?: string; // URL o base64 de la imagen de portada
  mostUsed?: boolean;
}
