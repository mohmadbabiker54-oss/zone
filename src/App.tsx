import { ReactNode, useState, useEffect, useRef, useMemo, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationService, LocationResult } from './services/locationService';

// Fix Leaflet icon issues in Vite
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- GLOBAL CONFIGURATION (ZONE APP ENGINE) ---
const SYSTEM_API_KEY = 'AIzaSyDemTNqHM4F4beipfXbUT__3mvbgRVCmus';
const SYSTEM_GAS_URL = 'https://script.google.com/macros/s/AKfycbwM79ElW-MwwQW0qG5WeV5KRNqqTidI1JhL6yV-Fm9Lp3EpKzMGdlillHfCBoknfMqv/exec';
// ----------------------------------------------

import { 
  saveProducts, 
  getProducts, 
  saveMetadata, 
  getMetadata, 
  getCachedImage, 
  cacheImage 
} from './lib/storage';
import { 
  Power, 
  Bell, 
  User, 
  FileText, 
  RefreshCw, 
  Smartphone, 
  Plus,
  Minus,
  QrCode, 
  Briefcase, 
  Users, 
  History, 
  CreditCard, 
  ClipboardList, 
  Clock, 
  Settings, 
  ShoppingCart, 
  DollarSign,
  ChevronLeft,
  Lock,
  Search,
  X,
  Copy,
  CheckCircle,
  Camera,
  Upload,
  Trash2,
  Leaf,
  AlertTriangle,
  Image as ImageIcon,
  Flower2,
  Trees,
  Sprout,
  Container,
  FlaskConical,
  Sun,
  Cloud,
  Grape,
  Carrot,
  Hammer,
  Wind,
  Mountain,
  Infinity,
  Bug,
  Droplets,
  Home,
  Palmtree,
  Shrub,
  Pill,
  Scissors,
  Shovel,
  Wrench,
  Package,
  Store,
  Gift,
  TreePine,
  Cherry,
  Apple,
  Banana,
  Citrus,
  Wheat,
  Waves,
  Flame,
  Zap,
  Heart,
  Star,
  Globe,
  Compass,
  Map,
  MapPin,
  Anchor,
  Bike,
  Car,
  Plane,
  Train,
  Music,
  Video,
  Mic,
  Headphones,
  Book,
  Pen,
  Palette,
  Gamepad,
  Trophy,
  Target,
  Flag,
  Coffee,
  Utensils,
  GlassWater,
  Beer,
  Wine,
  Pizza,
  IceCream,
  Cake,
  Cookie,
  Candy,
  Egg,
  Fish,
  Bone,
  PawPrint,
  Bird,
  Rabbit,
  Turtle,
  Snail,
  Shell,
  Feather,
  Umbrella,
  Tent,
  Binoculars,
  Telescope,
  Microscope,
  Stethoscope,
  Activity,
  HeartPulse,
  Thermometer,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Moon,
  Sunrise,
  Sunset,
  Rainbow,
  Sparkles,
  ZapOff,
  Shield,
  Key,
  LockKeyhole,
  Eye,
  EyeOff,
  Fingerprint,
  Cpu,
  HardDrive,
  Database,
  Server,
  Monitor,
  Laptop,
  Tablet,
  Printer,
  Mouse,
  Keyboard,
  Speaker,
  Tv,
  Radio,
  Cast,
  Wifi,
  Bluetooth,
  Battery,
  Plug,
  Lightbulb,
  Flashlight,
  Calculator,
  Calendar,
  Mail,
  Inbox,
  Send,
  Archive,
  HardHat,
  Construction,
  Truck,
  Bus,
  Ship,
  TramFront,
  CableCar,
  MountainSnow,
  Trees as TreesIcon,
  TreeDeciduous,
  Clover,
  Flower,
  Dna,
  Atom,
  Magnet,
  GraduationCap,
  School,
  Library,
  Church,
  Hotel,
  Hospital,
  Factory,
  Warehouse,
  ShoppingBag,
  Tag,
  Ticket,
  Wallet,
  Coins,
  Banknote,
  Receipt,
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  Presentation,
  Languages,
  MessageSquare,
  MessageCircle,
  Phone,
  Video as VideoIcon,
  Share2,
  ExternalLink,
  Link,
  Paperclip,
  Bookmark,
  StickyNote,
  Folder,
  File,
  Files,
  Image,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Pentagon,
  Octagon,
  Star as StarIcon,
  Heart as HeartIcon,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Ghost,
  Skull,
  Crown,
  Gem,
  Medal,
  Award,
  Badge,
  Check,
  Equal,
  Divide,
  Percent,
  Hash,
  AtSign,
  Command,
  Option,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  Move,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Scale,
  GripVertical,
  GripHorizontal,
  MoreVertical,
  MoreHorizontal,
  Layout,
  Columns,
  Rows,
  Grid,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Type as TypeIcon
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

interface CSVRow {
  [key: string]: string;
}

interface UserData {
  name: string;
  fatherName: string;
  whatsapp: string;
}

interface GridItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  level: number;
  isGlossy?: boolean;
  key?: any;
}

// --- Components ---

// --- Components ---

const RegistrationScreen = ({ onComplete }: { onComplete: (data: UserData) => void }) => {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name && fatherName && whatsapp) {
      const data = { name, fatherName, whatsapp };
      localStorage.setItem('zone_user_data', JSON.stringify(data));
      onComplete(data);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#013220]/80 backdrop-blur-xl z-[90] flex flex-col p-6 items-center justify-center perspective-1000"
    >
      <motion.div 
        initial={{ rotateX: 20, y: 50, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        className="w-full max-w-md space-y-8 p-8 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.1)'
        }}
      >
        {/* Shine Effect */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none z-0"
        />

        <div className="text-center space-y-2 relative z-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-red-700 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-6 border-b-4 border-red-900"
          >
            <User size={48} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">مرحباً بك في زون</h1>
          <p className="text-white/60 font-bold">يرجى إدخال بياناتك للمرة الأولى</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-2">الاسم بالكامل</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 bg-white/5 border-2 border-white/10 rounded-2xl px-6 font-bold text-white focus:border-red-600 focus:ring-0 transition-all outline-none placeholder:text-white/20"
              placeholder="أدخل اسمك..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-2">اسم الأب</label>
            <input 
              required
              type="text" 
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="w-full h-14 bg-white/5 border-2 border-white/10 rounded-2xl px-6 font-bold text-white focus:border-red-600 focus:ring-0 transition-all outline-none placeholder:text-white/20"
              placeholder="أدخل اسم الأب..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-2">رقم الواتساب</label>
            <input 
              required
              type="tel" 
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full h-14 bg-white/5 border-2 border-white/10 rounded-2xl px-6 font-bold text-white focus:border-red-600 focus:ring-0 transition-all outline-none placeholder:text-white/20"
              placeholder="09XXXXXXXX"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full h-16 bg-[#B71C1C] text-white rounded-2xl font-black text-lg shadow-xl shadow-red-900/40 flex items-center justify-center space-x-reverse space-x-3 border-b-4 border-red-900"
          >
            <span>حفظ والدخول</span>
            <ChevronLeft size={24} />
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CartModal = ({ isOpen, onClose, cart, onRemove, onClearAll, onProceedToInvoice }: { isOpen: boolean, onClose: () => void, cart: any[], onRemove: (index: number) => void, onClearAll: () => void, onProceedToInvoice: () => void }) => {
  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * 1000 || 0), 0);

  return (
    <div className="fixed inset-0 z-[250] bg-[#042f22] overflow-y-auto custom-scrollbar">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="min-h-screen flex flex-col relative"
      >
        {/* Sticky Header - Narrow Range */}
        <div className="sticky top-0 z-50 p-4 border-b border-white/10 bg-[#042f22]/90 backdrop-blur-xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="p-2 bg-red-600 rounded-xl shadow-lg relative group overflow-hidden">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ShoppingCart size={24} className="text-white" />
              </motion.div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">سلة المشتريات</h2>
              <p className="text-yellow-500/60 text-[10px] font-bold uppercase tracking-widest leading-none">Review Your Items</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-3">
            {cart.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClearAll}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-black text-xs flex items-center space-x-reverse space-x-2 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={14} />
                <span>إفراغ السلة</span>
              </motion.button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content Section - Scrollable with the page */}
        <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ShoppingCart size={150} className="mb-6 opacity-10" />
              </motion.div>
              <p className="text-3xl font-black text-white/40">السلة فارغة حالياً</p>
              <p className="text-lg font-bold mt-2 text-yellow-500/30">ابدأ بإضافة بعض النباتات الجميلة لبيتك</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-8 px-8 py-4 bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded-2xl font-black"
              >
                تصفح المنتجات الآن
              </motion.button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {cart.map((item, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, x: 50 }}
                      key={`${item.label}-${index}`}
                      className="flex items-center space-x-reverse space-x-4 p-4 bg-white/5 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all duration-500 relative overflow-hidden"
                    >
                      {/* Background Glow */}
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-600/10 blur-3xl rounded-full group-hover:bg-yellow-600/20 transition-colors" />
                      
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img 
                          src={item.image || null} 
                          alt={item.label} 
                          className="w-full h-full object-cover rounded-2xl shadow-2xl border-2 border-white/20 relative z-10 transform group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-xl flex items-center justify-center shadow-xl border border-white/20 z-20">
                          1
                        </div>
                      </div>
                      
                      <div className="flex-1 relative z-10">
                        <h3 className="font-black text-white text-lg leading-tight mb-1 group-hover:text-yellow-500 transition-colors">{item.label}</h3>
                        <div className="flex items-center space-x-reverse space-x-2">
                          <span className="text-yellow-500 font-black text-xl drop-shadow-md">{(parseFloat(item.price) * 1000).toLocaleString()}</span>
                          <span className="text-white/30 text-[10px] font-bold">SDG</span>
                        </div>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onRemove(index)}
                        className="p-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 relative z-10"
                      >
                        <Trash2 size={24} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer Section - Now part of the scrollable content */}
              <div className="mt-12 p-8 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10 relative z-10">
                  <div className="text-center md:text-right">
                    <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] mb-2">إجمالي المبلغ المستحق</p>
                    <div className="flex items-baseline space-x-reverse space-x-3">
                      <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_10px_20px_rgba(234,179,8,0.4)]">
                        {total.toLocaleString()}
                      </span>
                      <span className="text-yellow-500/60 font-black text-2xl">SDG</span>
                    </div>
                  </div>
                  
                  <div className="h-px w-full md:w-px md:h-20 bg-white/10 hidden md:block" />
                  
                  <div className="text-center md:text-left">
                    <p className="text-white/40 text-sm font-bold mb-2 uppercase tracking-widest">ملخص السلة</p>
                    <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/10">
                      <span className="text-white font-black text-4xl">{cart.length}</span>
                      <span className="text-white/60 font-bold mr-3 text-lg">منتجات مختارة</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-reverse sm:space-x-6 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 h-20 rounded-[1.5rem] font-black text-xl bg-white/5 text-white border border-white/10 transition-all flex items-center justify-center space-x-reverse space-x-3"
                  >
                    <ChevronLeft size={24} className="rotate-180" />
                    <span>متابعة التسوق</span>
                  </motion.button>
                  
                  <motion.button
                    disabled={cart.length === 0}
                    whileHover={cart.length > 0 ? { scale: 1.02, y: -5 } : {}}
                    whileTap={cart.length > 0 ? { scale: 0.98 } : {}}
                    onClick={onProceedToInvoice}
                    className={`flex-[2] h-20 rounded-[1.5rem] font-black text-2xl shadow-[0_25px_50px_-12px_rgba(183,28,28,0.5)] flex items-center justify-center space-x-reverse space-x-4 border-b-8 transition-all relative overflow-hidden group ${
                      cart.length > 0 
                      ? 'bg-gradient-to-r from-red-700 to-red-600 text-white border-red-900' 
                      : 'bg-white/10 text-white/20 border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-25deg]" />
                    <FileText size={32} />
                    <span>إتمام الطلب وعرض الفاتورة</span>
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};


const InvoiceModal = ({ isOpen, onClose, onProceedToPayment, cart, userData }: { isOpen: boolean, onClose: () => void, onProceedToPayment: () => void, cart: any[], userData: UserData | null }) => {
  const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * 1000 || 0), 0);

  const numberToArabicWords = (n: number) => {
    // Simple implementation for common amounts, can be expanded
    const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
    if (n === 0) return "صفر";
    // This is a placeholder for a full library like 'number-to-arabic-words'
    // For now, we'll return a formatted string
    return `${n.toLocaleString('ar-EG')} جنيه سوداني فقط لا غير`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md perspective-1000">
      <motion.div 
        initial={{ scale: 0.8, rotateY: 15, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col border border-white/20"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Shine Effect */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] pointer-events-none z-50"
        />
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 left-4 z-50 bg-red-600 text-white p-2 rounded-full shadow-lg">
          <X size={24} />
        </button>

        {/* Invoice Content (Template) */}
        <div className="p-8 bg-white relative min-h-[1000px] flex flex-col">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
            <img src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" alt="watermark" className="w-4/5" />
          </div>

          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8 relative z-10">
            <div className="text-left">
              <h1 className="text-xl font-black text-green-800 leading-tight">KILIMANJARO ZONE</h1>
              <p className="text-sm font-black text-gray-800 tracking-widest">AGRIBUSINESS</p>
            </div>
            <div className="flex flex-col items-center">
              <img src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" alt="logo" className="w-16 h-16 object-contain" />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-green-800">مشتل زون</h1>
              <p className="text-sm font-black text-gray-800">للأعمال الزراعية</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-8 relative z-10 font-bold text-gray-800">
            <div className="space-y-2">
              <p><span className="text-gray-400">الاسم بالكامل:</span> {userData?.name} {userData?.fatherName}</p>
            </div>
            <div className="text-right space-y-2">
              <p><span className="text-gray-400">التاريخ:</span> {date}</p>
              <p><span className="text-gray-400">رقم الهاتف:</span> {userData?.whatsapp}</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 relative z-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border-y-2 border-gray-800">
                  <th className="p-4 text-right border-x border-gray-300 text-xl font-[900]">اسم المنتج</th>
                  <th className="p-4 text-center border-x border-gray-300 text-xl font-[900]">الكمية</th>
                  <th className="p-4 text-center border-x border-gray-300 text-xl font-[900]">السعر</th>
                  <th className="p-4 text-left border-x border-gray-300 text-xl font-[900]">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {/* Grouping cart items by name */}
                {Object.values(cart.reduce((acc, item) => {
                  if (!acc[item.label]) acc[item.label] = { ...item, qty: 0 };
                  acc[item.label].qty += 1;
                  return acc;
                }, {} as any)).map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="p-3 text-right font-bold">{item.label}</td>
                    <td className="p-3 text-center font-bold">{item.qty}</td>
                    <td className="p-3 text-center font-bold">{(parseFloat(item.price) * 1000).toLocaleString()}</td>
                    <td className="p-3 text-left font-bold">{(parseFloat(item.price) * 1000 * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800 bg-gray-50">
                  <td colSpan={3} className="p-4 text-right font-black text-xl">المجموع الكلي</td>
                  <td className="p-4 text-left font-black text-xl text-green-700">{total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            
            <div className="mt-6 p-4 bg-gray-50 border-r-4 border-green-700">
              <p className="text-lg font-black text-gray-800">
                فقط: <span className="text-green-700">{numberToArabicWords(total)}</span>
              </p>
            </div>

            {/* Action Button - Moved Higher and Changed to Green */}
            <div className="mt-8 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={onProceedToPayment}
                className="w-full h-16 rounded-2xl font-black text-xl shadow-[0_20px_40px_rgba(21,128,61,0.3)] flex items-center justify-center space-x-reverse space-x-4 border-b-4 bg-gradient-to-r from-green-700 to-green-600 text-white border-green-900 transition-all"
              >
                <CreditCard size={28} />
                <span>انتقل إلى بيانات الدفع</span>
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t-2 border-gray-800 flex justify-between items-end relative z-10">
            <div className="text-xs font-black text-gray-600 space-y-1">
              <p>أم درمان - مدينة النيل</p>
              <p>0123317749 / 0900951555</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 border-4 border-blue-900 rounded-full flex items-center justify-center opacity-30 rotate-12">
                <div className="text-[10px] font-black text-blue-900 text-center uppercase">
                  مشتل زون<br/>للأعمال الزراعية<br/>2026
                </div>
              </div>
              <p className="text-[10px] font-black mt-2">الختم الرسمي</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SuccessScreen = ({ onBackToHome }: { onBackToHome: () => void }) => {
  const petals = Array.from({ length: 20 });
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Falling Petals */}
      {petals.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: `${Math.random() * 100}%`, 
            rotate: 0,
            opacity: 0 
          }}
          animate={{ 
            top: '110%', 
            rotate: 360,
            opacity: [0, 1, 1, 0],
            x: [0, Math.random() * 100 - 50, 0]
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute pointer-events-none"
        >
          <Flower2 size={24} className="text-pink-200/60" />
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-16 px-6 text-center">
        <div /> {/* Spacer */}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6 max-w-xl"
        >
          <h2 className="text-4xl font-black text-green-900 drop-shadow-sm leading-tight">
            تم توثيق طلبك بنجاح في أرشيف زون المشفر..
          </h2>
          <p className="text-2xl font-bold text-green-700/80 italic leading-relaxed">
            "شكراً لثقتك بـ (زون) واختيارك لها.. لقد استلمنا طلبك"
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(234, 179, 8, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToHome}
          className="w-full max-w-md py-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-red-900 rounded-2xl font-black text-2xl shadow-[0_10px_50px_rgba(234,179,8,0.4)] flex items-center justify-center space-x-reverse space-x-4 border-b-4 border-yellow-800 relative overflow-hidden group"
        >
          {/* Radiant Glow Effect */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-200/20 blur-xl"
          />
          <Home size={32} className="relative z-10" />
          <span className="relative z-10">العودة للشاشة الرئيسية</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const PaymentModal = ({ isOpen, onClose, userData, cart, onSuccess }: { isOpen: boolean, onClose: () => void, userData: UserData | null, cart: any[], onSuccess: () => void }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationResult | null>(null);
  const [markerPos, setMarkerPos] = useState<[number, number]>([15.6550, 32.4850]); // Precise Omdurman/Nile Area
  const [mapZoom, setMapZoom] = useState(17);
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('standard'); 
  const [accuracyWarning, setAccuracyWarning] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const receiptContentRef = useRef<HTMLDivElement>(null);
  const invoiceContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchInitialLoc = async () => {
        const loc = await LocationService.getCurrentLocation();
        
        if (loc.coords) {
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          const acc = loc.coords.accuracy || 1000;
          
          // AGGRESSIVE LOCAL BOUNDARY (Omdurman/Khartoum Box)
          // Khartoum is approx 15.5, 32.5. We strictly trust only a 60km radius.
          // anything outside lat [15.1 - 16.0] or lng [32.1 - 33.0] is REJECTED.
          const isFarAway = lat < 15.1 || lat > 16.1 || lng < 32.1 || lng > 33.1; 
          
          if (isFarAway || acc > 500) {
            // It's likely the IP-based location in Shendi, Port Sudan or just bad signal
            setMarkerPos([15.6550, 32.4850]); // Residential Omdurman / Nile Area
            setMapZoom(16);
            setAccuracyWarning("إشارة الموقع تقريبية جداً. يرجى سحب الدبوس ووضعه يدوياً (أمام باب المكان) الذي تود الاستلام فيه.");
          } else if (acc <= 50) {
            // High precision auto-lock (Neighborhood level found)
            setMarkerPos([lat, lng]);
            setMapZoom(18); 
            setCurrentLocation(loc);
            setAccuracyWarning("رائع! تم تحديد جيرانك بدقة؛ يرجى الآن سحب الدبوس (أمام بابك) تماماً لضمان وصول المندوب.");
          } else {
            // Moderate lock
            setMarkerPos([lat, lng]);
            setMapZoom(17); 
            setCurrentLocation(loc);
            setAccuracyWarning("تم العثور على موقعك التقريبي؛ يرجى التأكد من سحب الدبوس ووضعه (أمام باب الاستلام) بدقة.");
          }
        } else if (loc.error) {
          setMarkerPos([15.6550, 32.4850]);
          setMapZoom(16);
          setAccuracyWarning("تعذر جلب موقعك بدقة. تم فتح الخريطة في أم درمان؛ يرجى تحديد موقعك يدوياً.");
        }
      };
      
      fetchInitialLoc();
    }
  }, [isOpen]);

  const handleManualMapUpdate = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setMapZoom(18); // STREET LEVEL (Safer than 19 for tile availability)
    setAccuracyWarning(null);
    setCurrentLocation({
      coords: { latitude: lat, longitude: lng, accuracy: 0 },
      isAccurate: true,
      timestamp: Date.now()
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("1297423");
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const generateSecurePDF = async () => {
    if (!userData || !receipt) return;
    
    setIsGenerating(true);
    try {
      // Ensure images are loaded and layout is stable
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      // 1. Capture Map Section (Page 1)
      if (mapContentRef.current) {
        const canvas = await html2canvas(mapContentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfPageHeight), undefined, 'FAST');
        
        if (markerPos) {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${markerPos[0]},${markerPos[1]}`;
          // Link overlay on the map image area (approx)
          pdf.link(24, 70, 160, 80, { url: mapsUrl });
        }
      }

      // 2. Capture Receipt Section (Page 2)
      if (receiptContentRef.current) {
        pdf.addPage();
        const canvas = await html2canvas(receiptContentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfPageHeight), undefined, 'FAST');
      }

      // 3. Capture Invoice Section (Page 3+)
      if (invoiceContentRef.current) {
        const canvas = await html2canvas(invoiceContentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const totalHeight = (canvas.height * pdfWidth) / canvas.width;
        let currentPosition = 0;
        
        while (currentPosition < totalHeight) {
          pdf.addPage();
          pdf.addImage(
            imgData, 
            'JPEG', 
            0, 
            -currentPosition, 
            pdfWidth, 
            totalHeight,
            undefined,
            'FAST'
          );
          currentPosition += pdfPageHeight;
        }
      }
      
      // Set Metadata
      pdf.setProperties({
        title: 'Zone Invoice & Payment Proof',
        subject: 'Secure Archiving',
        author: 'Zone Agribusiness',
        creator: 'Zone App'
      });

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${userData.name}_${userData.fatherName}_${dateStr}-${userData.whatsapp}.pdf`.replace(/\s+/g, '_');
      
      if (userData && fileName) {
        // Prepare PDF for Google Apps Script
        const pdfBase64 = pdf.output('datauristring').split(',')[1];
        
        // Send to Google Apps Script (doPost)
        try {
          const response = await fetch(SYSTEM_GAS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
              pdfBase64,
              fileName
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log("PDF sent to Google Drive successfully:", result);
          } else {
            console.error("Server responded with an error");
          }
        } catch (err) {
          console.error("Error sending PDF to Google Drive:", err);
        }
      }

      pdf.save(fileName);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setReceipt(compressedBase64);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="w-full h-full overflow-y-auto relative custom-scrollbar flex flex-col"
        style={{
          background: 'rgba(10, 46, 31, 1)',
        }}
      >
        {/* Shine Effect */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] pointer-events-none z-0"
        />
        {/* Floral Frame Decoration - Removed problematic top-left image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="https://picsum.photos/seed/flowers2/200/200" className="absolute -bottom-10 -right-10 w-40 h-40 opacity-40 -rotate-12" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 border-[20px] border-transparent border-t-yellow-600/10 border-b-yellow-600/10 opacity-20" />
        </div>

        <div className="p-8 relative z-10 flex flex-col items-center flex-1 justify-center max-w-2xl mx-auto w-full">
          <button onClick={onClose} className="absolute top-8 left-8 text-white/60 hover:text-white bg-white/10 p-3 rounded-full">
            <X size={32} />
          </button>

          <div className="mb-8 text-center">
            <div className="w-20 h-20 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-600/50">
              <CreditCard size={40} className="text-yellow-500" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">تحديث بيانات الدفع</h2>
            <p className="text-yellow-500/80 text-sm font-bold">يرجى تحويل المبلغ للحساب أدناه</p>
          </div>

          {/* Account Details - Royal Presentation */}
          <div className="w-full bg-black/40 p-8 rounded-[2rem] border-2 border-yellow-600/20 shadow-inner mb-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 via-transparent to-yellow-600/20 rounded-[2rem] blur-sm opacity-50" />
            
            <div className="relative space-y-6 text-center">
              <div className="space-y-1">
                <p className="text-xs font-black text-yellow-600/60 uppercase tracking-[0.3em]">اسم الحساب</p>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] italic font-serif">
                  Mazin Mustafa
                </h3>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent" />

              <div className="space-y-1">
                <p className="text-xs font-black text-yellow-600/60 uppercase tracking-[0.3em]">رقم الحساب</p>
                <div className="flex items-center justify-center space-x-reverse space-x-4">
                  <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest">
                    1297423
                  </h3>
                  
                  {/* Inflatable Copy Button */}
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={handleCopy}
                      className="p-3 bg-yellow-600 text-red-900 rounded-2xl shadow-lg relative"
                    >
                      <Copy size={20} />
                      <AnimatePresence>
                        {isCopying && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: -40, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-xl"
                          >
                            تم النسخ!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <p className="text-[10px] font-black mt-2 text-yellow-500/80 animate-pulse">
                      {isCopying ? "تم نسخ رقم بنك بامان" : "اضغط لنسخ رقم بنك بامان"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Selection Section */}
          <div className="w-full space-y-4">
            <div className="bg-black/40 p-4 rounded-3xl border-2 border-yellow-600/20 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
              
              <div className="bg-blue-600/30 border-2 border-blue-400 p-5 rounded-2xl mb-4 flex items-start space-x-reverse space-x-4 shadow-[0_0_30px_rgba(37,99,235,0.2)] backdrop-blur-md relative z-10">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0 border-2 border-white/20 animate-pulse">
                  <Map className="text-white" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-white text-base font-black leading-tight">هام جداً لضمان التوصيل:</p>
                  <p className="text-blue-100 text-xs font-bold leading-relaxed">
                    يجب عليك سحب "الدبوس الأحمر" على الخريطة ووضعه يدوياً <span className="text-yellow-400 underline">(أمام باب منزلك)</span> تماماً. المندوب سيعتمد على هذا الموقع الجغرافي للوصول إليك.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-2">
                <div className="text-right">
                  <h4 className="text-white font-black text-lg flex items-center space-x-reverse space-x-2">
                    <Globe size={20} className={mapMode === 'satellite' ? 'text-blue-400' : 'text-yellow-500'} />
                    <span>تحديد موقع باب المنزل بدقة</span>
                  </h4>
                  <p className="text-yellow-500/60 text-[10px] font-bold">يرجى تحريك الخريطة أو سحب الدبوس</p>
                </div>
                {markerPos && markerPos.length === 2 && (
                   <div className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                     <span className="text-green-500 text-[10px] font-black tracking-widest font-mono">
                       {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
                     </span>
                   </div>
                )}
              </div>

              {/* Interactive Map */}
              <div className="w-full h-[450px] rounded-2xl overflow-hidden border-2 border-white/20 relative z-0 shadow-inner bg-gray-900">
                <MapContainer center={markerPos} zoom={mapZoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                  {mapMode === 'standard' ? (
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                  ) : (
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles &copy; Esri'
                    />
                  )}
                  <MapController center={markerPos} zoom={mapZoom} />
                  <MapEvents onMapClick={handleManualMapUpdate} />
                  {markerPos && markerPos.length === 2 && (
                    <Marker 
                      position={markerPos} 
                      draggable={true}
                      eventHandlers={{
                        dragend: (e) => {
                          const marker = e.target;
                          const pos = marker.getLatLng();
                          handleManualMapUpdate(pos.lat, pos.lng);
                        },
                      }}
                    />
                  )}
                </MapContainer>

                {/* Custom Map Controls */}
                <div className="absolute top-4 left-4 z-[400] flex flex-col space-y-3">
                  {/* Zoom Controls */}
                  <div className="flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    <button 
                      onClick={() => setMapZoom(prev => Math.min(prev + 1, 19))}
                      className="p-3 hover:bg-gray-100 text-black border-b border-gray-100 flex items-center justify-center"
                    >
                      <Plus size={20} className="font-black" />
                    </button>
                    <button 
                      onClick={() => setMapZoom(prev => Math.max(prev - 1, 10))}
                      className="p-3 hover:bg-gray-100 text-black flex items-center justify-center"
                    >
                      <Minus size={20} className="font-black" />
                    </button>
                  </div>

                  <button
                    onClick={() => setMapMode(mapMode === 'standard' ? 'satellite' : 'standard')}
                    className={`flex items-center space-x-reverse space-x-2 px-4 py-2 rounded-xl border-2 transition-all ${
                      mapMode === 'satellite' 
                      ? 'bg-blue-600 text-white border-blue-400' 
                      : 'bg-white text-gray-800 border-gray-300'
                    } shadow-xl font-bold`}
                  >
                    <Globe size={18} />
                    <span className="text-xs">{mapMode === 'satellite' ? 'نمط القمر الصناعي' : 'نمط الخريطة'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setMarkerPos([15.6333, 32.4833]);
                      setMapZoom(16);
                    }}
                    className="bg-black/80 text-white px-3 py-2 rounded-xl border border-yellow-600/50 text-[10px] font-black flex items-center space-x-reverse space-x-2 shadow-2xl"
                  >
                    <Home size={14} />
                    <span>توسيط أم درمان</span>
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 z-[400] flex flex-col space-y-3 items-end">
                   {/* Accuracy Status Capsule */}
                   {currentLocation?.coords?.accuracy && (
                     <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 mb-2">
                        <p className="text-[10px] text-white font-bold flex items-center space-x-reverse space-x-2">
                           <Wind size={12} className="text-blue-400" />
                           <span>دقة الإشارة: {Math.round(currentLocation.coords.accuracy)} متر</span>
                        </p>
                     </div>
                   )}

                  <button
                    onClick={async () => {
                      const loc = await LocationService.getCurrentLocation();
                      if (loc.coords) {
                        handleManualMapUpdate(loc.coords.latitude, loc.coords.longitude);
                      }
                    }}
                    className="bg-white text-black p-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.4)] border-4 border-yellow-600 hover:bg-yellow-50 transition-all flex items-center"
                  >
                    <Compass size={32} className="text-yellow-600" />
                  </button>
                </div>
              </div>

              {accuracyWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-blue-600/20 border border-blue-600/50 rounded-xl flex items-start space-x-reverse space-x-3"
                >
                  <MapPin className="text-blue-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-blue-400 text-[10px] font-black leading-relaxed">
                    {accuracyWarning}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="w-full space-y-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-40 rounded-3xl border-4 border-dashed transition-all flex flex-col items-center justify-center space-y-4 group relative overflow-hidden ${
                receipt ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              {receipt ? (
                <>
                  <div className="absolute inset-0">
                    {receipt ? <img src={receipt} className="w-full h-full object-cover opacity-20" /> : null}
                  </div>
                  <CheckCircle size="12vw" className="text-green-500 relative z-10" />
                  <span className="text-green-500 font-black text-lg relative z-10">تم إرفاق الإشعار بنجاح</span>
                </>
              ) : (
                <>
                  <div className="flex space-x-reverse space-x-4">
                    <Camera size="12vw" className="text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                    <Upload size="12vw" className="text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-white font-black text-xl group-hover:text-yellow-400 transition-colors">ارفق اشعار بنكك</span>
                    <span className="text-yellow-500/80 font-bold text-sm">بنفس قيمة الفاتورة</span>
                  </div>
                </>
              )}
            </motion.button>

            <motion.button
              disabled={!receipt || isGenerating}
              whileTap={{ scale: 0.98 }}
              onClick={generateSecurePDF}
              className={`w-full h-16 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center space-x-reverse space-x-3 ${
                receipt && !isGenerating
                ? 'bg-red-600 text-white border-b-4 border-red-900' 
                : 'bg-gray-700 text-white/30 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin" size={24} />
              ) : (
                <>
                  <span>تأكيد عملية الدفع والأرشفة</span>
                  <ChevronLeft size={24} />
                </>
              )}
            </motion.button>
          </div>

        {/* Hidden PDF Templates Section */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none z-[-100]">
          {/* Page 1: Map / Geolocation Template */}
          <div ref={mapContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #1f2937', paddingBottom: '24px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#065f46' }}>KILIMANJARO ZONE</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937', letterSpacing: '0.1em' }}>AGRIBUSINESS</p>
              </div>
              <img src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" alt="logo" style={{ width: '80px', height: '80px' }} />
              <div style={{ textAlign: 'right' }}>
                <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#065f46' }}>مشتل زون</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937' }}>للأعمال الزراعية</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px', fontSize: '20px', fontWeight: 'bold' }}>
               <p>العميل: {userData?.name} {userData?.fatherName}</p>
               <p style={{ textAlign: 'right' }}>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>

            {markerPos && (
              <div style={{ padding: '24px', backgroundColor: '#f0f9ff', border: '3px solid #0369a1', borderRadius: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: '#0369a1' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0369a1', marginBottom: '20px', textAlign: 'center' }}>التوثيق الجغرافي (بروتوكول الدقة فائقـة):</h3>
                
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={`https://static-maps.yandex.ru/1.x/?ll=${markerPos[1]},${markerPos[0]}&z=18&l=sat&size=450,450&pt=${markerPos[1]},${markerPos[0]},pm2rdl`} 
                    alt="Map"
                    style={{ width: '300px', height: '300px', borderRadius: '12px', border: '3px solid #0369a1' }}
                  />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '2px solid #bae6fd', marginBottom: '20px' }}>
                      <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>إحداثيات التوصيل المعتمدة:</p>
                      <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#0c4a6e', fontFamily: 'monospace' }}>
                        {markerPos[0].toFixed(6)}<br/>{markerPos[1].toFixed(6)}
                      </p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#0369a1', borderRadius: '12px', color: '#ffffff', fontWeight: '999', fontSize: '18px' }}>
                      رابط خرائط جوجل مفعل
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: '20px', fontSize: '14px', color: '#334155', textAlign: 'center', fontWeight: '900' }}>
                   تم تحديد الموقع يدوياً من قبل العميل لضمان الوصول لباب المنزل بدقة 1 متر.
                </p>
              </div>
            )}

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#64748b' }}>هذه الصفحة مخصصة لغرفة عمليات التوصيل - نظام زون الذكي</p>
            </div>
          </div>

          {/* Page 2: Bank Receipt Template */}
          <div ref={receiptContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif', textAlign: 'center' }} dir="rtl">
            <div style={{ width: '100%', border: '8px solid #f3f4f6', borderRadius: '24px', overflow: 'hidden' }}>
              {receipt ? <img src={receipt} style={{ width: '100%', height: 'auto' }} alt="receipt" /> : null}
            </div>
            <div style={{ marginTop: '20px', opacity: 0.5 }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold' }}>إشعار الدفع الإلكتروني المرفق - نظام أرشفة مشتل زون</p>
            </div>
          </div>

          {/* Page 3+: Full Invoice Template */}
          <div ref={invoiceContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #1f2937', paddingBottom: '24px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#065f46' }}>KILIMANJARO ZONE</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937', letterSpacing: '0.1em' }}>AGRIBUSINESS</p>
              </div>
              <img src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" alt="logo" style={{ width: '80px', height: '80px' }} />
              <div style={{ textAlign: 'right' }}>
                <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#065f46' }}>مشتل زون</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937' }}>للأعمال الزراعية</p>
              </div>
            </div>

            <div style={{ marginBottom: '30px', fontSize: '20px', fontWeight: 'bold' }}>
              <p>فاتورة مبيعات للعميل: {userData?.name} {userData?.fatherName}</p>
              <p>الرقم التعريفي: {userData?.whatsapp}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderTop: '4px solid #1f2937', borderBottom: '4px solid #1f2937' }}>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '20px', fontWeight: '900' }}>المنتج</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '20px', fontWeight: '900' }}>الكمية</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '20px', fontWeight: '900' }}>السعر</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '20px', fontWeight: '900' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(cart.reduce((acc, item) => {
                  if (!acc[item.label]) acc[item.label] = { ...item, qty: 0 };
                  acc[item.label].qty += 1;
                  return acc;
                }, {} as any)).map((item: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '2px solid #e5e7eb', fontSize: '18px' }}>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>{item.label}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>{(parseFloat(item.price) * 1000).toLocaleString()}</td>
                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>{(parseFloat(item.price) * 1000 * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '4px solid #1f2937', backgroundColor: '#f9fafb' }}>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'right', fontWeight: '900', fontSize: '24px' }}>المجموع النهائي</td>
                  <td style={{ padding: '24px', textAlign: 'left', fontWeight: '900', fontSize: '24px', color: '#047857' }}>
                    {(cart.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0) * 1000).toLocaleString()} SDG
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '4px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#4b5563' }}>
                <p>تم الإصدار بتاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                <p>أم درمان - مدينة النيل</p>
                <p>0123317749 / 0900951555</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', border: '6px solid rgba(6, 95, 70, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-15deg)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '999', color: 'rgba(6, 95, 70, 0.4)', textAlign: 'center' }}>KILIMANJARO<br/>OFFICIAL</span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: '900' }}>الختم الإلكتروني المعتمد</p>
              </div>
            </div>
          </div>
        </div>
          {/* Separate Receipt Page Template */}
          <div id="receipt-content-to-capture" ref={receiptContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
            <div style={{ width: '100%', border: '8px solid #f3f4f6', borderRadius: '24px', overflow: 'hidden' }}>
              {receipt ? <img src={receipt} style={{ width: '100%', height: 'auto' }} alt="receipt" /> : null}
            </div>
            
            {/* Small Footer for receipt page too */}
            <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.5 }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold' }}>تابع لمشتل زون لخدمات الحدائق - إشعار دفع مؤكد</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CachedImage = ({ src, alt, className, style, referrerPolicy }: { src: string, alt: string, className?: string, style?: any, referrerPolicy?: any }) => {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadImage = async () => {
      if (!src || src.trim() === "") return;
      
      // Try to get from cache first
      const cached = await getCachedImage(src);
      if (cached && isMounted) {
        setDisplaySrc(cached);
        return;
      }

      // If not in cache, fetch and store
      try {
        const response = await fetch(src, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        await cacheImage(src, blob);
        const localUrl = URL.createObjectURL(blob);
        if (isMounted) setDisplaySrc(localUrl);
      } catch (error) {
        // Silently fail for caching errors to avoid console noise for users
        // This usually happens due to CORS restrictions on external images
        if (isMounted) setDisplaySrc(src); 
      }
    };

    loadImage();
    return () => { isMounted = false; };
  }, [src]);

  const finalSrc = displaySrc || src || "https://picsum.photos/seed/plant/800/800";

  if (!finalSrc || finalSrc.trim() === "") return null;

  return (
    <motion.img 
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.8 }}
      src={finalSrc} 
      alt={alt} 
      className={className}
      style={style}
      referrerPolicy={referrerPolicy}
    />
  );
};

const ProductCard = ({ name, price, image, onAddToCart }: { name: string, price: string, image: string, onAddToCart: () => void, key?: any }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chargeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleAdd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 2000); 
    onAddToCart();
  };

  const startCharging = () => {
    chargeTimer.current = setTimeout(() => {
      setIsCharging(true);
    }, 500); // Start showing charging effect after 0.5s
  };

  const stopCharging = () => {
    if (chargeTimer.current) clearTimeout(chargeTimer.current);
    setIsCharging(false);
  };

  return (
    <motion.div 
      onPointerDown={startCharging}
      onPointerUp={stopCharging}
      onPointerLeave={stopCharging}
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ rotateY: 5, rotateX: 2, y: -10 }}
      viewport={{ once: true }}
      animate={isCharging ? { scale: 0.98, rotateX: -5 } : { scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="relative w-full h-[122vh] rounded-[2.5rem] overflow-hidden flex flex-col group cursor-pointer perspective-1000 preserve-3d"
      style={{
        background: 'rgba(6, 78, 59, 0.25)',
        backdropFilter: 'blur(25px)',
        boxShadow: isCharging 
          ? '0 80px 120px -20px rgba(16, 185, 129, 0.5), inset 0 0 30px rgba(255,255,255,0.2)' 
          : '0 40px 80px -15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255,255,255,0.05)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}
    >
      <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />
      
      {/* Light Shoulders (Glow at corners) */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${isCharging ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#10B981]/40 to-transparent blur-2xl transition-all duration-500 ${isCharging ? 'scale-150 blur-3xl' : 'scale-100'}`} />
        <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#10B981]/40 to-transparent blur-2xl transition-all duration-500 ${isCharging ? 'scale-150 blur-3xl' : 'scale-100'}`} />
      </div>

      {/* Shine/Lustre Effect */}
      <motion.div 
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none z-10"
      />

      {/* Image Layer (80%) - Carved/Rising effect */}
      <div className="relative h-[80%] w-full p-4 overflow-hidden">
          <motion.div className="w-full h-full rounded-[2rem] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] bg-black/20 relative">
            <CachedImage 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
            {/* Inner Shadow Overlay */}
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.4)] pointer-events-none" />
          </motion.div>
      </div>

      {/* Info Section (20-25%) - Distinct Elevation */}
      <div className="flex-1 px-6 pb-6 flex flex-col justify-between relative z-20">
        <div className="flex justify-between items-center space-x-reverse space-x-2">
          <h2 className="text-xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {name}
          </h2>
          <div className="flex items-center space-x-reverse space-x-2">
            <span className="text-xl font-black text-[#10B981] drop-shadow-sm">
              {(parseFloat(price) * 1000).toLocaleString()}
            </span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">SDG</span>
          </div>
        </div>

        {/* High-Elevation 3D Emerald Button */}
        <div className="relative mt-2">
          <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ y: 2, scale: 0.98 }}
            onClick={handleAdd}
            className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all duration-500 flex items-center justify-center space-x-reverse space-x-2 shadow-[0_20px_40px_rgba(6,78,59,0.5)] border-b-4 border-[#043a2c] relative z-10 overflow-hidden ${
              isFlashing 
              ? 'bg-white text-[#064E3B] shadow-[0_0_40px_rgba(16,185,129,1)]' 
              : 'bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white'
            }`}
          >
            <ShoppingCart size={16} className={isFlashing ? 'animate-bounce' : ''} />
            <span className="transition-all duration-300">
              {isFlashing ? 'تمت إضافة المنتج بنجاح' : 'إضافة إلى السلة'}
            </span>
            
            {/* Glow effect */}
            <AnimatePresence>
              {isFlashing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 2 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/40 blur-3xl"
                />
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Deep Shadow for 3D effect */}
          <div className="absolute -bottom-2 left-4 right-4 h-8 bg-black/40 blur-2xl rounded-full -z-10" />
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedButton = ({ icon, label, onClick, level, isGlossy }: GridItemProps) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
    setTimeout(onClick, 400);
  };

  const flashColor = level >= 4 ? 'bg-[#39FF14]' : 'bg-white';
  const glowColor = level >= 4 ? 'shadow-[0_0_25px_rgba(57,255,20,0.9)]' : 'shadow-[0_0_15px_rgba(255,255,255,0.4)]';

  const isLevel2 = level === 2;
  
  // Glossy Test Dimensions
  const buttonWidth = isGlossy ? 'w-[28vw]' : (isLevel2 ? 'w-[40vw]' : 'w-[25vw]');
  const buttonHeight = isGlossy ? 'h-[28vw]' : (isLevel2 ? 'h-[22vw]' : 'h-[25vw]');
  const borderRadius = isGlossy ? 'rounded-[16px]' : (isLevel2 ? 'rounded-xl' : 'rounded-2xl');

  if (isGlossy) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 group cursor-pointer w-full z-10">
        <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />
        
        <motion.div 
          whileTap={{ scale: 0.9, y: 4 }}
          onClick={handleClick}
          className={`relative ${buttonWidth} ${buttonHeight} ${borderRadius} overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center`}
          style={{
            background: 'linear-gradient(to bottom, #E30613, #9E040D)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)'
          }}
        >
          {/* Glossy Overlay (Top Half) */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 pointer-events-none"
            style={{
              borderRadius: '16px 16px 50% 50% / 16px 16px 15% 15%'
            }}
          />

          {/* Icon - Centered in top half area but visually balanced */}
          <div className="text-white relative z-10 scale-[1.2] mb-2">
            {icon}
          </div>

          <AnimatePresence>
            {isFlashing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/40"
                transition={{ duration: 0.1 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Text Label */}
        <span className="text-[3.5vw] font-bold text-[#4A4A4A] text-center leading-tight px-1">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3 group cursor-pointer w-full z-10">
      <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />
      
      <motion.div 
        whileTap={{ scale: 0.85, y: 6 }}
        transition={{ type: "spring", stiffness: 500, damping: 12 }}
        onClick={handleClick}
        className={`relative ${buttonWidth} ${buttonHeight} bg-gradient-to-b from-red-500 to-red-700 ${borderRadius} flex items-center justify-center shadow-xl border-b-[6px] border-red-900 active:border-b-0 overflow-hidden ${glowColor}`}
      >
        <AnimatePresence>
          {isFlashing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-20 ${flashColor}`}
              transition={{ duration: 0.1 }}
            />
          )}
        </AnimatePresence>

        <motion.div 
          className="absolute inset-1 border-2 border-white/10 rounded-xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <div className="text-white relative z-10">
          {icon}
        </div>
      </motion.div>

      {/* Enhanced Banner Label */}
      <div className="relative w-full flex justify-center mt-2">
        <div className="w-full h-auto min-h-[6vw] flex items-center justify-center bg-transparent">
          <span className="text-[4.5vw] font-[900] text-gray-900 text-center leading-none px-1 break-words w-full drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

const NotificationModal = ({ isOpen, onClose, notifications }: { isOpen: boolean, onClose: () => void, notifications: any[] }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        className="w-full max-w-lg bg-[#f0f4f0] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-t-8 border-[#064e3b] relative"
      >
        {/* Ornate Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#064e3b]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#064e3b]/5 rounded-tr-full pointer-events-none" />

        <div className="bg-[#064e3b] p-8 text-white flex justify-between items-center relative overflow-hidden">
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center space-x-reverse space-x-4 z-10"
          >
            <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg ring-4 ring-yellow-500/30">
              <Bell className="text-emerald-950" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">التنبيهات الإدارية</h2>
              <p className="text-yellow-500/60 text-[10px] uppercase font-black tracking-[0.2em]">Official Notifications</p>
            </div>
          </motion.div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-white/20 rounded-full transition-all bg-white/10 z-10"
          >
            <X size={24} />
          </button>
          
          {/* Animated Background Pulse */}
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"
          />
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar relative">
          {notifications.map((note, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.15, type: 'spring' }}
              style={{ backgroundColor: note.bg, color: note.color }}
              className="p-8 rounded-[2rem] border-2 border-black/5 relative overflow-hidden shadow-xl hover:shadow-2xl transition-all group"
            >
              {/* Ornate Leaf Decorations */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flower2 size={60} strokeWidth={1} />
              </div>
              <div className="absolute bottom-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sprout size={60} strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-reverse space-x-3 mb-4 opacity-60">
                  <Clock size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">تنبيه رقم {notifications.length - idx}</span>
                </div>
                <p className="text-xl font-black leading-loose text-right whitespace-pre-wrap drop-shadow-sm italic">
                  {note.text}
                </p>
              </div>
              
              {/* Ornate Corner Accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-current opacity-20" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-current opacity-20" />
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-[#064e3b]/5 rounded-full flex items-center justify-center mb-6">
                <Bell size={64} className="text-[#064e3b]/20" />
              </div>
              <p className="font-black text-2xl text-[#064e3b]/40">لا توجد تنبيهات حالياً</p>
              <p className="text-emerald-900/40 text-sm font-bold mt-2">ستظهر الرسائل المهمة هنا فور وصولها</p>
            </div>
          )}
        </div>
        
        <div className="bg-[#064e3b]/5 p-6 text-center border-t border-[#064e3b]/10">
          <p className="text-[#064e3b]/60 text-xs font-black uppercase tracking-widest">المؤسسة العامة للزراعة التجميلية - زون</p>
        </div>
      </motion.div>
    </div>
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. Handle Audio Logic
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      
      const fadeOut = setTimeout(() => {
        if (audioRef.current) {
          const interval = setInterval(() => {
            if (audioRef.current && audioRef.current.volume > 0.1) {
              audioRef.current.volume -= 0.1;
            } else {
              clearInterval(interval);
            }
          }, 100);
        }
      }, 2500);
      
      // Cleanup fadeOut if component unmounts
      return () => clearTimeout(fadeOut);
    }
  }, []);

  useEffect(() => {
    // 2. CRITICAL: Handle Transition Logic (Independent of Audio)
    const timer = setTimeout(() => {
      console.log("Transitioning to main screen...");
      onComplete();
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#042f22] flex items-center justify-center overflow-hidden z-[100]">
      <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />

      {/* Pulsating Radiant Rays (Moving Outward to Edges) */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ 
          rotate: 360,
        }}
        transition={{ 
          duration: 30, repeat: Infinity, ease: "linear"
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute inset-0 flex items-center justify-center" style={{ rotate: `${i * 30}deg` }}>
            {/* Pulsating Ray Beam */}
            <motion.div
              className="absolute w-[8px] origin-bottom"
              style={{ 
                height: '150vh',
                bottom: '50%',
                background: 'linear-gradient(to top, #FFD700, #F59E0B, transparent)',
                filter: 'blur(1px) drop-shadow(0 0 20px #FFD700)',
                mixBlendMode: 'screen'
              }}
              animate={{ 
                scaleY: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          </div>
        ))}
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Intense Pulsating Central Glow */}
        <motion.div 
          className="absolute w-[160vw] h-[160vw] bg-[#FFD700]/10 rounded-full blur-[80px]"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute w-[100vw] h-[100vw] bg-[#F59E0B]/20 rounded-full blur-[60px]"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </div>

      {/* Core Logo Enclosed in a Circle with Axial Rotation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          scale: { duration: 0.8, ease: "easeOut" },
          opacity: { duration: 0.5 }
        }}
        className="relative z-10 w-80 h-80 flex items-center justify-center translate-z-0"
      >
        {/* The Circle Enclosure (Prison-like/Sun-like) */}
        <div className="absolute inset-0 rounded-full border-[6px] border-yellow-500/50 shadow-lg backdrop-blur-sm bg-white/5" />
        <div className="absolute inset-2 rounded-full border-2 border-white/10" />
        
        <img 
          src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" 
          alt="Zone Logo"
          className="w-60 h-60 object-contain drop-shadow-xl mix-blend-multiply"
          style={{ 
            maskImage: 'radial-gradient(circle, black 55%, transparent 56%)',
            WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 56%)'
          }}
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  );
};

const PlantDiagnosis = ({ isOpen, onClose, paidApiKey }: { isOpen: boolean, onClose: () => void, paidApiKey?: string | null }) => {
  const [source, setSource] = useState<'camera' | 'gallery' | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("عذراً، لا يمكن الوصول إلى الكاميرا.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (source === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [source]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        setSource(null);
        analyzeImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        setSource(null);
        analyzeImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    setResult(null);
    try {
      const apiKey = (paidApiKey && paidApiKey.trim().startsWith('AIza')) 
        ? paidApiKey 
        : SYSTEM_API_KEY;
        
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      const prompt = `قم بتحليل هذه الصورة وتعرف على النبات أولاً.
      يجب أن يتضمن الرد اسم النبات بوضوح في حقل plantName.
      إذا كان النبات سليماً، اجعل isHealthy صح و diagnosis "سليم".
      إذا كان مصاباً، قم بتصنيف المرض بشكل عام (مثلاً: فطريات، حشرات، نقص مغذيات) واقترح دواءً عاماً وبديلاً بلدياً (طبيعياً) متاحاً في السودان.
      قدم نصائح للرعاية بالنبات في بيئة السودان (تجنب ذكر الربيع).
      يجب أن يكون الرد باللغة العربية الفصحى المفهومة في السودان.`;

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plantName: { type: Type.STRING },
              isHealthy: { type: Type.BOOLEAN },
              diagnosis: { type: Type.STRING },
              generalMedicine: { type: Type.STRING },
              localAlternative: { type: Type.STRING },
              careTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["plantName", "isHealthy", "diagnosis", "careTips"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setResult({ error: "عذراً، حدث خطأ أثناء تحليل الصورة." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative"
      >
        <div className="p-6 border-b flex justify-between items-center bg-green-50">
          <div className="flex items-center space-x-reverse space-x-3">
            <Leaf className="text-green-600" size={24} />
            <h2 className="text-xl font-black text-green-900">تشخيص أمراض النباتات</h2>
          </div>
          <button onClick={() => { onClose(); setImage(null); setResult(null); setSource(null); }} className="p-2 hover:bg-green-100 rounded-full text-green-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!source && !image && !loading && !result && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSource('camera')}
                className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-3xl border-2 border-dashed border-green-200 hover:bg-green-100 transition-all group"
              >
                <Camera size={48} className="text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-black text-green-900">فتح الكاميرا</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-3xl border-2 border-dashed border-green-200 hover:bg-green-100 transition-all group"
              >
                <Upload size={48} className="text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-black text-green-900">رفع من الاستوديو</span>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              </button>
            </div>
          )}

          {source === 'camera' && (
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-square flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <button 
                onClick={captureImage}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-green-500 shadow-xl flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-200" />
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
              <p className="font-black text-green-900 animate-pulse">جاري تحليل حالة النبات...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {result.error ? (
                <div className="p-8 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center text-center space-y-4">
                  <AlertTriangle size={64} className="text-red-500" />
                  <p className="font-black text-red-900 text-lg">{result.error}</p>
                </div>
              ) : (
                <>
                  {image && (
                    <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-lg border-2 border-green-100">
                      <img src={image} alt="Captured" className="w-full h-full object-cover" />
                      {result.plantName && (
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-white font-black text-center text-lg">{result.plantName}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="p-5 bg-green-50 rounded-3xl border border-green-100">
                      <p className="text-center font-black text-green-900 text-lg">
                        اسم النبات: <span className="text-green-600 underline decoration-green-200">{result.plantName || 'غير معروف'}</span>
                      </p>
                    </div>

                    {result.isHealthy ? (
                      <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center space-x-reverse space-x-4 text-green-900">
                        <CheckCircle size={32} className="shrink-0" />
                        <p className="font-black text-lg">ألف مبروك، النبات بصحة جيدة وهو سليم.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 space-y-2">
                          <h3 className="font-black text-orange-900 flex items-center space-x-reverse space-x-2">
                            <AlertTriangle size={20} />
                            <span>التشخيص: {result.diagnosis || 'لم يتم التحديد'}</span>
                          </h3>
                          <div className="space-y-3">
                            <p className="text-sm font-bold text-orange-800">
                              <span className="font-black">العلاج المقترح:</span> {result.generalMedicine || 'لا يوجد علاج محدد حالياً'}
                            </p>
                            {result.localAlternative && (
                              <p className="text-sm font-bold text-green-800 bg-green-100/50 p-3 rounded-xl">
                                <span className="font-black">البديل البلدي (في حال عدم توفر الدواء):</span> {result.localAlternative}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.careTips && result.careTips.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-black text-green-900 flex items-center space-x-reverse space-x-2">
                          <Leaf size={20} />
                          <span>نصائح للرعاية بالنبات:</span>
                        </h3>
                        <ul className="space-y-2">
                          {result.careTips.map((tip: string, i: number) => (
                            <li key={i} className="flex items-start space-x-reverse space-x-2 text-sm font-bold text-gray-700">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button 
                onClick={() => { setImage(null); setResult(null); setSource(null); }}
                className="w-full h-14 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all"
              >
                تحديث / تشخيص جديد
              </button>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Arrow keys from potentially triggering unintended navigation if requested
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const target = e.target as HTMLElement;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [data, setData] = useState<CSVRow[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [filters, setFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);
  const [isCartInflating, setIsCartInflating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [showCartHint, setShowCartHint] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const paidApiKey = useMemo(() => {
    if (data.length === 0) return null;
    const keys = Object.keys(data[0]);
    if (keys.length < 8) return null;
    const h1Value = keys[7]; // Cell H1 is the 8th column header
    return h1Value && h1Value.startsWith('AIza') ? h1Value : null;
  }, [data]);

  const notifications = useMemo(() => {
    if (data.length === 0) return [];
    // Assuming keys are in order of columns A, B, C...
    const keys = Object.keys(data[0]);
    if (keys.length < 8) return [];
    
    // Column H is Index 7. We take non-empty cells from Column H.
    // Cell H2 corresponds to data[0][keys[7]]
    return data
      .filter(row => {
        const msg = row[keys[7]];
        return msg && msg.toString().trim() !== '';
      })
      .map(row => ({
        text: row[keys[7]],
        bg: row[keys[8]] || '#fef3c7', // Column I for background (fallback to cream)
        color: row[keys[9]] || '#78350f' // Column J for font color (fallback to brown)
      }));
  }, [data]);

  const normalize = (text: string) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, '')
      .replace(/ال/g, '') // Remove "Al-" prefix common in Arabic
      .trim();
  };

  const transformDriveUrl = (url: string) => {
    if (!url || typeof url !== 'string') return "";
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http')) return "";
    
    // Handle Google Drive view links
    const driveRegex = /\/file\/d\/([^\/]+)\//;
    const match = trimmedUrl.match(driveRegex);
    if (match && match[1]) {
      return `https://docs.google.com/uc?export=download&id=${match[1]}`;
    }
    
    // Handle sharing links like drive.google.com/open?id=...
    if (trimmedUrl.includes('drive.google.com/open?id=')) {
      const id = trimmedUrl.split('id=')[1]?.split('&')[0];
      if (id) return `https://docs.google.com/uc?export=download&id=${id}`;
    }

    return trimmedUrl;
  };

  // Shortcut Logic: Jump to product if match found
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const normalizedQuery = normalize(searchQuery);
      
      // Search in the entire dataset (Column 1)
      const match = data.find(row => {
        const keys = Object.keys(row);
        const name = row[keys[0]] || '';
        const normalizedName = normalize(name);
        return normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName);
      });

      if (match) {
        const keys = Object.keys(match);
        const colC = keys[2];
        const colD = keys[3];
        if (match[colC] && match[colD]) {
          // If we are not already at this level or category, jump to it
          if (currentLevel !== 3 || filters[0] !== match[colC] || filters[1] !== match[colD]) {
            setFilters([match[colC], match[colD]]);
            setCurrentLevel(3);
          }
        }
      }
    }
  }, [searchQuery, data]);

  const drumLockAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (cart.length > 0 && !isCartDrawerOpen && !isInvoiceOpen) {
      const timer = setTimeout(() => setShowCartHint(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowCartHint(false);
    }
  }, [cart.length, isCartDrawerOpen, isInvoiceOpen]);

  useEffect(() => {
    // Check for existing user data
    const savedUserData = localStorage.getItem('zone_user_data');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }

    const fetchData = async () => {
      try {
        // 1. Load from Local Storage (IndexedDB) first for instant UI
        const cachedProducts = await getProducts();
        if (cachedProducts.length > 0) {
          setData(cachedProducts);
          setLoading(false);
          console.log("Loaded data from local storage (IndexedDB)");
        }

        // 2. Check for changes in Google Sheets
        try {
          // Try to get the last known version
          const lastVersion = await getMetadata('data_version');
          
          // Fetch with a check parameter
          const response = await fetch(`${SYSTEM_GAS_URL}?action=check&v=${lastVersion || '0'}`, {
            signal: AbortSignal.timeout(5000) // 5 second timeout for the check
          });
          
          if (!response.ok) throw new Error('Network response was not ok');
          const result = await response.json();

          // If GAS script returns { changed: false }, we stop here
          if (result && result.changed === false) {
            console.log("No changes detected in Google Sheets. Using cached data.");
            return;
          }

          // 3. If changed or no check possible, fetch the data
          const fullResponse = await fetch(SYSTEM_GAS_URL, {
            signal: AbortSignal.timeout(15000) // 15 second timeout for full fetch
          });
          
          if (!fullResponse.ok) throw new Error('Full fetch failed');
          const jsonData = await fullResponse.json();
          
          // Simple hash check
          const currentHash = JSON.stringify(jsonData).length;
          if (currentHash === lastVersion) {
            console.log("Data hash matches. No updates needed.");
            return;
          }

          // Update local storage and state
          setData(jsonData as any[]);
          await saveProducts(jsonData as any[]);
          await saveMetadata('data_version', currentHash);
          
          setLoading(false);
          console.log("Data updated from Google Sheets and saved to local storage");
        } catch (fetchError) {
          console.warn("Network fetch failed, staying with cached data:", fetchError);
          // If we have cached data, we're already showing it, so just stop loading
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in data synchronization:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    
    setNotification({
      message: "تم حذف المنتج من السلة",
      type: 'info'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  const clearCart = () => {
    setCart([]);
    setIsLocked(false);
    setNotification({
      message: "تم إفراغ السلة بنجاح",
      type: 'info'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    const savedData = localStorage.getItem('zone_user_data');
    if (!savedData) {
      setShowRegistration(true);
    }
  };

  const handleRegistrationComplete = (data: UserData) => {
    setUserData(data);
    setShowRegistration(false);
  };

  const addToCart = (item: any) => {
    const newCart = [...cart, item];
    setCart(newCart);
    setIsCartInflating(true);
    setTimeout(() => setIsCartInflating(false), 500);

    setNotification({
      message: "تمت إضافة المنتج بنجاح. يمكنك مراجعة، تعديل، أو حذف محتويات السلة الآن.",
      type: 'success'
    });
    // Clear success notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => prev?.type === 'success' ? null : prev);
    }, 3000);
  };

  // Filtering Logic
  const currentItems = useMemo(() => {
    if (data.length === 0) return [];
    
    const keys = Object.keys(data[0]);
    const colA = keys[0] || 'A'; // Column 1 (Name for Product Card)
    const colB = keys[1] || 'B'; // Column 2 (Price for Product Card)
    const colC = keys[2] || 'C'; // Column 3 (Level 1 Category)
    const colD = keys[3] || 'D'; // Column 4 (Level 2 Sub-category)
    const colF = keys[5] || 'F'; // Column 6 (Image 1)
    const colG = keys[6] || 'G'; // Column 7 (Image 2)
    
    const getProductImage = (row: any) => {
      const imgG = transformDriveUrl(row[colG]);
      const imgF = transformDriveUrl(row[colF]);
      return imgG || imgF || "";
    };

    let items: any[] = [];

    if (currentLevel === 1) {
      const unique = Array.from(new Set(data.map(row => row[colC]).filter(Boolean)));
      items = unique.map(val => ({ type: 'level1', label: val, id: val }));
    } else if (currentLevel === 2) {
      const filtered = data.filter(row => row[colC] === filters[0]);
      // Get unique non-empty sub-categories
      const unique = Array.from(new Set(filtered.map(row => row[colD]).filter(Boolean)));
      
      // Check if there are rows where Column D is empty for this Category
      const hasEmptySubCategory = filtered.some(row => !row[colD] || String(row[colD]).trim() === '');
      
      items = unique.map(val => ({ type: 'level2', label: val, id: val }));
      
      // If there are empty sub-categories, repeat the Category name as a sub-category button
      if (hasEmptySubCategory) {
        // Avoid duplicates if a sub-category already has the same name as the category
        if (!unique.includes(filters[0])) {
          items.push({ type: 'level2', label: filters[0], id: `repeat-${filters[0]}` });
        }
      }
    } else {
      // Level 3: Products
      const products = data.filter(row => {
        const matchCat = row[colC] === filters[0];
        const isRepeated = filters[1] === filters[0];
        
        // If it's a repeated button, match empty Column D
        // Otherwise match the specific sub-category
        const matchSub = isRepeated 
          ? (!row[colD] || String(row[colD]).trim() === '' || row[colD] === filters[1])
          : row[colD] === filters[1];
          
        return matchCat && matchSub;
      });

      items = products.map((product, i) => ({ 
        type: 'product',
        label: product[colA] || product[colD] || product[colC] || "نبات نادر", 
        id: `product-${i}`,
        price: product[colB] || "0",
        image: getProductImage(product)
      }));
    }

    // Apply Search Query - Global Smart Search
    if (searchQuery.trim() !== '') {
      const normalizedQuery = normalize(searchQuery);
      
      // Global search across all products (bypassing hierarchy)
      const allProducts = data.map((product, i) => ({ 
        type: 'product',
        label: product[colA] || product[colD] || "نبات نادر", 
        id: `product-search-${i}`,
        price: product[colB] || "0",
        image: getProductImage(product)
      })).filter(item => 
        normalize(item.label).startsWith(normalizedQuery) || 
        normalize(item.label).includes(normalizedQuery)
      );

      return allProducts;
    }

    return items;
  }, [data, currentLevel, filters, searchQuery]);

  const handleItemClick = (label: string) => {
    setFilters(prev => [...prev, label]);
    setCurrentLevel(prev => Math.min(prev + 1, 3));
    setSearchQuery(''); // Reset search on navigation
  };

  const goBack = () => {
    setFilters(prev => prev.slice(0, -1));
    setCurrentLevel(prev => Math.max(prev - 1, 1));
    setSearchQuery(''); // Reset search on navigation
  };

  const getIcon = (label: string, index: number) => {
    const labelLower = label.toLowerCase();
    const normalizedLabel = normalize(label);
    
    // Smart Mapping based on label keywords
    if (normalizedLabel.includes('شتول') || normalizedLabel.includes('شتله')) return <Sprout size="8vw" />;
    // Pot Icons Logic - Simplified and synchronized
    const isPot = normalizedLabel.includes('اصيص') || normalizedLabel.includes('اصايص') || normalizedLabel.includes('مركن') || normalizedLabel.includes('وعاء') || normalizedLabel.includes('اوعيه');
    
    // FORCE Main category "أصائص" to use the clay pot icon
    if (label === 'أصائص' || label === 'أصايص' || label === 'اصائص' || label === 'اصايص') {
      return (
        <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10h10l-1 9H8l-1-9Z" fill="rgba(255,255,255,0.1)" />
          <path d="M6 5h12v3H6z" fill="rgba(255,255,255,0.2)" />
          <path d="M9 13h6" stroke="white" />
          <path d="M10 16h4" stroke="white" />
        </svg>
      );
    }

    if (isPot || normalizedLabel.includes('فخار') || normalizedLabel.includes('سمنت') || normalizedLabel.includes('استيل')) {
      // Base Pot Design
      const BasePot = ({ children }: { children?: ReactNode }) => (
        <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10h10l-1 9H8l-1-9Z" fill="rgba(255,255,255,0.1)" />
          <path d="M6 5h12v3H6z" fill="rgba(255,255,255,0.2)" />
          {children}
        </svg>
      );

      // Sub-category variations
      if (normalizedLabel.includes('بلاستيك')) {
        return (
          <BasePot>
            <path d="M8 13h8" stroke="white" opacity="0.4" strokeWidth="1" />
            <path d="M9 16h6" stroke="white" opacity="0.4" strokeWidth="1" />
          </BasePot>
        );
      }
      if (normalizedLabel.includes('خزف') || normalizedLabel.includes('سيراميك')) {
        return (
          <BasePot>
            <circle cx="12" cy="14" r="2.5" stroke="white" strokeWidth="1.5" />
            <circle cx="12" cy="14" r="0.5" fill="white" />
          </BasePot>
        );
      }
      if (normalizedLabel.includes('استيل') || normalizedLabel.includes('معدن')) {
        return (
          <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 10h12l-1 10H7l-1-10Z" fill="rgba(255,255,255,0.1)" />
            <path d="M5 5h14v3H5z" fill="white" />
            <path d="M8 10v10M12 10v10M16 10v10" stroke="white" strokeWidth="1" opacity="0.4" />
          </svg>
        );
      }
      if (normalizedLabel.includes('سمنت') || normalizedLabel.includes('اسمنت') || normalizedLabel.includes('خرسان')) {
        return (
          <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 10h14l-1.5 10h-11L5 10Z" fill="rgba(255,255,255,0.2)" />
            <path d="M4 5h16v4H4z" fill="white" />
            <rect x="8" y="12" width="2" height="2" fill="white" />
            <rect x="14" y="15" width="2" height="2" fill="white" />
          </svg>
        );
      }
      if (normalizedLabel.includes('زينه') || normalizedLabel.includes('ديكور')) {
        return (
          <BasePot>
            <path d="M12 10v4M10 12h4" stroke="white" />
          </BasePot>
        );
      }

      // Default for Main "Pots" category and "Clay Pots" - Exactly the same
      return (
        <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10h10l-1 9H8l-1-9Z" fill="rgba(255,255,255,0.1)" />
          <path d="M6 5h12v3H6z" fill="rgba(255,255,255,0.2)" />
          <path d="M9 13h6" stroke="white" />
          <path d="M10 16h4" stroke="white" />
        </svg>
      );
    }
    if (normalizedLabel.includes('سماد') || normalizedLabel.includes('اسمدة')) return <FlaskConical size="8vw" />;
    if (normalizedLabel.includes('مبيد') || normalizedLabel.includes('مبيدات')) return <Bug size="8vw" />;
    if (normalizedLabel.includes('زهر') || normalizedLabel.includes('ورد') || normalizedLabel.includes('زهور')) return <Flower2 size="8vw" />;
    if (normalizedLabel.includes('شجر') || normalizedLabel.includes('اشجار')) return <Trees size="8vw" />;
    if (normalizedLabel.includes('صبار') || normalizedLabel.includes('صباريات')) return <Mountain size="8vw" />;
    if (normalizedLabel.includes('ظل') || normalizedLabel.includes('داخليه')) return <Home size="8vw" />;
    if (normalizedLabel.includes('خارجي') || normalizedLabel.includes('شمس')) return <Sun size="8vw" />;
    if (normalizedLabel.includes('متسلق') || normalizedLabel.includes('متسلقات')) return <Infinity size="8vw" />;
    if (normalizedLabel.includes('عطر') || normalizedLabel.includes('عطريات')) return <Wind size="8vw" />;
    if (normalizedLabel.includes('فاكهه') || normalizedLabel.includes('فواكه') || normalizedLabel.includes('مثمر')) return (
      <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="white">
        {/* Trunk */}
        <path d="M12 22c-1 0-1.5-1-1.5-4 0-2 1-4 1.5-6 0.5 2 1.5 4 1.5 6 0 3-.5 4-1.5 4z" />
        {/* Canopy */}
        <path d="M12 2C7 2 3 6 3 11c0 3 2 6 5 8M12 2c5 0 9 4 9 9 0 3-2 6-5 8" stroke="white" strokeWidth="1.5" fill="none" />
        {/* Fruits (Apples) */}
        <circle cx="12" cy="5" r="1.2" />
        <circle cx="8" cy="8" r="1.2" />
        <circle cx="16" cy="8" r="1.2" />
        <circle cx="12" cy="9" r="1.2" />
        <circle cx="10" cy="12" r="1.2" />
        <circle cx="14" cy="12" r="1.2" />
        <circle cx="7" cy="11" r="1" />
        <circle cx="17" cy="11" r="1" />
        <circle cx="12" cy="14" r="1" />
        <circle cx="9" cy="5" r="0.8" />
        <circle cx="15" cy="5" r="0.8" />
        <circle cx="12" cy="17" r="0.8" />
      </svg>
    );
    if (normalizedLabel.includes('خضر') || normalizedLabel.includes('خضروات')) return <Carrot size="8vw" />;
    if (normalizedLabel.includes('ادوات') || normalizedLabel.includes('معدات')) return (
      <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Pruning Shears (Scissors) */}
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 17l10-10" />
        <path d="M16 17L6 7" />
        {/* Tiller/Rake (عذاقة) */}
        <path d="M12 4v4" strokeWidth="1.5" />
        <path d="M9 4h6" strokeWidth="1.5" />
        <path d="M9 2l1-2M15 2l-1-2" strokeWidth="1" opacity="0.6" />
      </svg>
    );
    if (normalizedLabel.includes('نخيل') || normalizedLabel.includes('نخله')) return <Palmtree size="8vw" />;
    if (normalizedLabel.includes('شجيرات')) return <Shrub size="8vw" />;
    if (normalizedLabel.includes('طبيه') || normalizedLabel.includes('علاج')) return <Pill size="8vw" />;
    if (normalizedLabel.includes('زينه')) return <Flower size="8vw" />;
    if (labelLower.includes('هديه') || labelLower.includes('هدايا')) return <Gift size="8vw" />;
    if (labelLower.includes('تربه') || labelLower.includes('طين')) return <Mountain size="8vw" />;
    if (labelLower.includes('ري') || labelLower.includes('ماء')) return <Droplets size="8vw" />;
    if (labelLower.includes('مقص') || labelLower.includes('تقليم')) return <Scissors size="8vw" />;
    if (labelLower.includes('كوريك') || labelLower.includes('حفر')) return <Shovel size="8vw" />;
    if (labelLower.includes('صيانه')) return <Wrench size="8vw" />;
    if (labelLower.includes('متجر') || labelLower.includes('محل')) return <Store size="8vw" />;
    if (labelLower.includes('كرتون') || labelLower.includes('تغليف')) return <Package size="8vw" />;
    if (labelLower.includes('صنوبر')) return <TreePine size="8vw" />;
    if (labelLower.includes('كرز')) return <Cherry size="8vw" />;
    if (labelLower.includes('تفاح')) return <Apple size="8vw" />;
    if (labelLower.includes('موز')) return <Banana size="8vw" />;
    if (labelLower.includes('حمضيات') || labelLower.includes('ليمون')) return <Citrus size="8vw" />;
    if (labelLower.includes('قمح') || labelLower.includes('محاصيل')) return <Wheat size="8vw" />;
    if (labelLower.includes('بحر') || labelLower.includes('نيل')) return <Waves size="8vw" />;
    if (labelLower.includes('نار') || labelLower.includes('حراره')) return <Flame size="8vw" />;
    if (labelLower.includes('كهرباء') || labelLower.includes('طاقه')) return <Zap size="8vw" />;
    if (labelLower.includes('حب') || labelLower.includes('قلب')) return <Heart size="8vw" />;
    if (labelLower.includes('نجمه') || labelLower.includes('مميز')) return <Star size="8vw" />;
    if (labelLower.includes('ع عالم') || labelLower.includes('دولي')) return <Globe size="8vw" />;
    if (labelLower.includes('بوصله') || labelLower.includes('اتجاه')) return <Compass size="8vw" />;
    if (labelLower.includes('خريطه')) return <Map size="8vw" />;
    if (labelLower.includes('مرسى')) return <Anchor size="8vw" />;
    if (labelLower.includes('دراجه')) return <Bike size="8vw" />;
    if (labelLower.includes('سياره')) return <Car size="8vw" />;
    if (labelLower.includes('طائره')) return <Plane size="8vw" />;
    if (labelLower.includes('قطار')) return <Train size="8vw" />;
    if (labelLower.includes('موسيقى')) return <Music size="8vw" />;
    if (labelLower.includes('فيديو')) return <Video size="8vw" />;
    if (labelLower.includes('مايك')) return <Mic size="8vw" />;
    if (labelLower.includes('سماعه')) return <Headphones size="8vw" />;
    if (labelLower.includes('كتاب')) return <Book size="8vw" />;
    if (labelLower.includes('قلم')) return <Pen size="8vw" />;
    if (labelLower.includes('الوان')) return <Palette size="8vw" />;
    if (labelLower.includes('العاب')) return <Gamepad size="8vw" />;
    if (labelLower.includes('كاس')) return <Trophy size="8vw" />;
    if (labelLower.includes('هدف')) return <Target size="8vw" />;
    if (labelLower.includes('علم')) return <Flag size="8vw" />;
    if (labelLower.includes('قهوه')) return <Coffee size="8vw" />;
    if (labelLower.includes('طعام')) return <Utensils size="8vw" />;
    if (labelLower.includes('ماء')) return <GlassWater size="8vw" />;
    if (labelLower.includes('بيتزا')) return <Pizza size="8vw" />;
    if (labelLower.includes('ايسكريم')) return <IceCream size="8vw" />;
    if (labelLower.includes('كيك')) return <Cake size="8vw" />;
    if (labelLower.includes('بسكويت')) return <Cookie size="8vw" />;
    if (labelLower.includes('حلاوه')) return <Candy size="8vw" />;
    if (labelLower.includes('بيض')) return <Egg size="8vw" />;
    if (labelLower.includes('سمك')) return <Fish size="8vw" />;
    if (labelLower.includes('عظم')) return <Bone size="8vw" />;
    if (labelLower.includes('حيوان')) return <PawPrint size="8vw" />;
    if (labelLower.includes('طير')) return <Bird size="8vw" />;
    if (labelLower.includes('ارنب')) return <Rabbit size="8vw" />;
    if (labelLower.includes('سلحفاه')) return <Turtle size="8vw" />;
    if (labelLower.includes('حلزون')) return <Snail size="8vw" />;
    if (labelLower.includes('صدف')) return <Shell size="8vw" />;
    if (labelLower.includes('ريشه')) return <Feather size="8vw" />;
    if (labelLower.includes('مظله')) return <Umbrella size="8vw" />;
    if (labelLower.includes('خيمه')) return <Tent size="8vw" />;
    if (labelLower.includes('منظار')) return <Binoculars size="8vw" />;
    if (labelLower.includes('تلسكوب')) return <Telescope size="8vw" />;
    if (labelLower.includes('مجهر')) return <Microscope size="8vw" />;
    if (labelLower.includes('سماعه_طبيه')) return <Stethoscope size="8vw" />;
    if (labelLower.includes('نشاط')) return <Activity size="8vw" />;
    if (labelLower.includes('نبض')) return <HeartPulse size="8vw" />;
    if (labelLower.includes('حراره')) return <Thermometer size="8vw" />;
    if (labelLower.includes('برق')) return <CloudLightning size="8vw" />;
    if (labelLower.includes('مطر')) return <CloudRain size="8vw" />;
    if (labelLower.includes('ثلج')) return <CloudSnow size="8vw" />;
    if (labelLower.includes('قمر')) return <Moon size="8vw" />;
    if (labelLower.includes('شروق')) return <Sunrise size="8vw" />;
    if (labelLower.includes('غروب')) return <Sunset size="8vw" />;
    if (labelLower.includes('قوس_قزح')) return <Rainbow size="8vw" />;
    if (labelLower.includes('لمعان')) return <Sparkles size="8vw" />;
    if (labelLower.includes('درع')) return <Shield size="8vw" />;
    if (labelLower.includes('مفتاح')) return <Key size="8vw" />;
    if (labelLower.includes('قفل')) return <LockKeyhole size="8vw" />;
    if (labelLower.includes('عين')) return <Eye size="8vw" />;
    if (labelLower.includes('بصمه')) return <Fingerprint size="8vw" />;
    if (labelLower.includes('معالج')) return <Cpu size="8vw" />;
    if (labelLower.includes('قرص')) return <HardDrive size="8vw" />;
    if (labelLower.includes('قاعده_بيانات')) return <Database size="8vw" />;
    if (labelLower.includes('خادم')) return <Server size="8vw" />;
    if (labelLower.includes('شاشه')) return <Monitor size="8vw" />;
    if (labelLower.includes('محمول')) return <Laptop size="8vw" />;
    if (labelLower.includes('تابلت')) return <Tablet size="8vw" />;
    if (labelLower.includes('طابعه')) return <Printer size="8vw" />;
    if (labelLower.includes('فاره')) return <Mouse size="8vw" />;
    if (labelLower.includes('لوحه_مفاتيح')) return <Keyboard size="8vw" />;
    if (labelLower.includes('مكبر_صوت')) return <Speaker size="8vw" />;
    if (labelLower.includes('تلفاز')) return <Tv size="8vw" />;
    if (labelLower.includes('راديو')) return <Radio size="8vw" />;
    if (labelLower.includes('بث')) return <Cast size="8vw" />;
    if (labelLower.includes('واي_فاي')) return <Wifi size="8vw" />;
    if (labelLower.includes('بلوتوث')) return <Bluetooth size="8vw" />;
    if (labelLower.includes('بطاريه')) return <Battery size="8vw" />;
    if (labelLower.includes('قابس')) return <Plug size="8vw" />;
    if (labelLower.includes('مصباح')) return <Lightbulb size="8vw" />;
    if (labelLower.includes('كشاف')) return <Flashlight size="8vw" />;
    if (labelLower.includes('حاسبه')) return <Calculator size="8vw" />;
    if (labelLower.includes('تقويم')) return <Calendar size="8vw" />;
    if (labelLower.includes('بريد')) return <Mail size="8vw" />;
    if (labelLower.includes('صندوق')) return <Inbox size="8vw" />;
    if (labelLower.includes('ارسال')) return <Send size="8vw" />;
    if (labelLower.includes('ارشيف')) return <Archive size="8vw" />;
    if (labelLower.includes('خوذه')) return <HardHat size="8vw" />;
    if (labelLower.includes('بناء')) return <Construction size="8vw" />;
    if (labelLower.includes('شاحنه')) return <Truck size="8vw" />;
    if (labelLower.includes('حافله')) return <Bus size="8vw" />;
    if (labelLower.includes('سفينه')) return <Ship size="8vw" />;
    if (labelLower.includes('ترام')) return <TramFront size="8vw" />;
    if (labelLower.includes('تلفريك')) return <CableCar size="8vw" />;
    if (labelLower.includes('جبل')) return <MountainSnow size="8vw" />;
    if (labelLower.includes('غابه')) return <TreesIcon size="8vw" />;
    if (labelLower.includes('شجره')) return <TreeDeciduous size="8vw" />;
    if (labelLower.includes('برسيم')) return <Clover size="8vw" />;
    if (labelLower.includes('نبته')) return <Flower size="8vw" />;
    if (labelLower.includes('حمض')) return <Dna size="8vw" />;
    if (labelLower.includes('ذره')) return <Atom size="8vw" />;
    if (labelLower.includes('مغناطيس')) return <Magnet size="8vw" />;
    if (labelLower.includes('تخرج')) return <GraduationCap size="8vw" />;
    if (labelLower.includes('مدرسه')) return <School size="8vw" />;
    if (labelLower.includes('مكتبه')) return <Library size="8vw" />;
    if (labelLower.includes('كنيسه')) return <Church size="8vw" />;
    if (labelLower.includes('فندق')) return <Hotel size="8vw" />;
    if (labelLower.includes('مستشفى')) return <Hospital size="8vw" />;
    if (labelLower.includes('مصنع')) return <Factory size="8vw" />;
    if (labelLower.includes('مستودع')) return <Warehouse size="8vw" />;
    if (labelLower.includes('حقيبه')) return <ShoppingBag size="8vw" />;
    if (labelLower.includes('بطاقه')) return <Tag size="8vw" />;
    if (labelLower.includes('تذكره')) return <Ticket size="8vw" />;
    if (labelLower.includes('محفظه')) return <Wallet size="8vw" />;
    if (labelLower.includes('عملات')) return <Coins size="8vw" />;
    if (labelLower.includes('نقد')) return <Banknote size="8vw" />;
    if (labelLower.includes('ايصال')) return <Receipt size="8vw" />;
    if (labelLower.includes('رسم_بياني')) return <BarChart size="8vw" />;
    if (labelLower.includes('دائره')) return <PieChart size="8vw" />;
    if (labelLower.includes('خط')) return <LineChart size="8vw" />;
    if (labelLower.includes('مساحه')) return <AreaChart size="8vw" />;
    if (labelLower.includes('عرض')) return <Presentation size="8vw" />;
    if (labelLower.includes('لغات')) return <Languages size="8vw" />;
    if (labelLower.includes('دردشه')) return <MessageSquare size="8vw" />;
    if (labelLower.includes('دائره_دردشه')) return <MessageCircle size="8vw" />;
    if (labelLower.includes('هاتف')) return <Phone size="8vw" />;
    if (labelLower.includes('مشاركه')) return <Share2 size="8vw" />;
    if (labelLower.includes('رابط_خارجي')) return <ExternalLink size="8vw" />;
    if (labelLower.includes('رابط')) return <Link size="8vw" />;
    if (labelLower.includes('مشبك')) return <Paperclip size="8vw" />;
    if (labelLower.includes('اشاره')) return <Bookmark size="8vw" />;
    if (labelLower.includes('ملاحظه')) return <StickyNote size="8vw" />;
    if (labelLower.includes('مجلد')) return <Folder size="8vw" />;
    if (labelLower.includes('ملف')) return <File size="8vw" />;
    if (labelLower.includes('ملفات')) return <Files size="8vw" />;
    if (labelLower.includes('صوره')) return <Image size="8vw" />;
    if (labelLower.includes('تشغيل')) return <Play size="8vw" />;
    if (labelLower.includes('توقف')) return <Pause size="8vw" />;
    if (labelLower.includes('مربع')) return <Square size="8vw" />;
    if (labelLower.includes('دائره_شكل')) return <Circle size="8vw" />;
    if (labelLower.includes('مثلث')) return <Triangle size="8vw" />;
    if (labelLower.includes('سداسي')) return <Hexagon size="8vw" />;
    if (labelLower.includes('خماسي')) return <Pentagon size="8vw" />;
    if (labelLower.includes('ثماني')) return <Octagon size="8vw" />;
    if (labelLower.includes('ابتسامه')) return <Smile size="8vw" />;
    if (labelLower.includes('حزن')) return <Frown size="8vw" />;
    if (labelLower.includes('عادي')) return <Meh size="8vw" />;
    if (labelLower.includes('غضب')) return <Angry size="8vw" />;
    if (labelLower.includes('ضحك')) return <Laugh size="8vw" />;
    if (labelLower.includes('شبح')) return <Ghost size="8vw" />;
    if (labelLower.includes('جمجمه')) return <Skull size="8vw" />;
    if (labelLower.includes('تاج')) return <Crown size="8vw" />;
    if (labelLower.includes('جوهره')) return <Gem size="8vw" />;
    if (labelLower.includes('ميداليه')) return <Medal size="8vw" />;
    if (labelLower.includes('جائزه')) return <Award size="8vw" />;
    if (labelLower.includes('وسام')) return <Badge size="8vw" />;
    if (labelLower.includes('صح')) return <Check size="8vw" />;
    if (labelLower.includes('ناقص')) return <Minus size="8vw" />;
    if (labelLower.includes('زائد')) return <Plus size="8vw" />;
    if (labelLower.includes('يساوي')) return <Equal size="8vw" />;
    if (labelLower.includes('قسمه')) return <Divide size="8vw" />;
    if (labelLower.includes('نسبه')) return <Percent size="8vw" />;
    if (labelLower.includes('هاشتاق')) return <Hash size="8vw" />;
    if (labelLower.includes('ات')) return <AtSign size="8vw" />;
    if (labelLower.includes('امر')) return <Command size="8vw" />;
    if (labelLower.includes('خيار')) return <Option size="8vw" />;
    if (labelLower.includes('اعلى')) return <ArrowUp size="8vw" />;
    if (labelLower.includes('اسفل')) return <ArrowDown size="8vw" />;
    if (labelLower.includes('يسار')) return <ArrowLeft size="8vw" />;
    if (labelLower.includes('يمين')) return <ArrowRight size="8vw" />;
    if (labelLower.includes('تخطيط')) return <Layout size="8vw" />;
    if (labelLower.includes('اعمده')) return <Columns size="8vw" />;
    if (labelLower.includes('صفوف')) return <Rows size="8vw" />;
    if (labelLower.includes('شبكه')) return <Grid size="8vw" />;
    if (labelLower.includes('قائمه')) return <List size="8vw" />;
    if (labelLower.includes('محاذاه_يسار')) return <AlignLeft size="8vw" />;
    if (labelLower.includes('محاذاه_وسط')) return <AlignCenter size="8vw" />;
    if (labelLower.includes('محاذاه_يمين')) return <AlignRight size="8vw" />;
    if (labelLower.includes('محاذاه_ضبط')) return <AlignJustify size="8vw" />;
    if (labelLower.includes('عريض')) return <Bold size="8vw" />;
    if (labelLower.includes('مائل')) return <Italic size="8vw" />;
    if (labelLower.includes('تحته_خط')) return <Underline size="8vw" />;
    if (labelLower.includes('مشطوب')) return <Strikethrough size="8vw" />;
    if (labelLower.includes('كود')) return <Code size="8vw" />;

    // Large pool of icons for fallback to ensure no repetition
    const iconPool = [
      <Sprout size="8vw" />, <Flower2 size="8vw" />, <Trees size="8vw" />, <Leaf size="8vw" />,
      <Container size="8vw" />, <FlaskConical size="8vw" />, <Bug size="8vw" />, <Droplets size="8vw" />,
      <Sun size="8vw" />, <Cloud size="8vw" />, <Wind size="8vw" />, <Mountain size="8vw" />,
      <Infinity size="8vw" />, <Grape size="8vw" />, <Carrot size="8vw" />, <Hammer size="8vw" />,
      <Home size="8vw" />, <Palmtree size="8vw" />, <Shrub size="8vw" />, <Mountain size="8vw" />,
      <Pill size="8vw" />, <Scissors size="8vw" />, <Shovel size="8vw" />, <Wrench size="8vw" />,
      <Package size="8vw" />, <Store size="8vw" />, <Gift size="8vw" />, <TreePine size="8vw" />,
      <Cherry size="8vw" />, <Apple size="8vw" />, <Banana size="8vw" />, <Citrus size="8vw" />,
      <Wheat size="8vw" />, <Waves size="8vw" />, <Flame size="8vw" />, <Zap size="8vw" />,
      <Heart size="8vw" />, <Star size="8vw" />, <Globe size="8vw" />, <Compass size="8vw" />,
      <Map size="8vw" />, <Anchor size="8vw" />, <Bike size="8vw" />, <Car size="8vw" />,
      <Plane size="8vw" />, <Train size="8vw" />, <Music size="8vw" />, <Video size="8vw" />,
      <Mic size="8vw" />, <Headphones size="8vw" />, <Book size="8vw" />, <Pen size="8vw" />,
      <Palette size="8vw" />, <Gamepad size="8vw" />, <Trophy size="8vw" />, <Target size="8vw" />,
      <Flag size="8vw" />, <Coffee size="8vw" />, <Utensils size="8vw" />, <GlassWater size="8vw" />,
      <Pizza size="8vw" />, <IceCream size="8vw" />, <Cake size="8vw" />, <Cookie size="8vw" />,
      <Candy size="8vw" />, <Egg size="8vw" />, <Fish size="8vw" />, <Bone size="8vw" />,
      <PawPrint size="8vw" />, <Bird size="8vw" />, <Rabbit size="8vw" />, <Turtle size="8vw" />,
      <Snail size="8vw" />, <Shell size="8vw" />, <Feather size="8vw" />, <Umbrella size="8vw" />,
      <Tent size="8vw" />, <Binoculars size="8vw" />, <Telescope size="8vw" />, <Microscope size="8vw" />,
      <Stethoscope size="8vw" />, <Activity size="8vw" />, <HeartPulse size="8vw" />, <Thermometer size="8vw" />,
      <CloudLightning size="8vw" />, <CloudRain size="8vw" />, <CloudSnow size="8vw" />, <Moon size="8vw" />,
      <Sunrise size="8vw" />, <Sunset size="8vw" />, <Rainbow size="8vw" />, <Sparkles size="8vw" />,
      <Shield size="8vw" />, <Key size="8vw" />, <LockKeyhole size="8vw" />, <Eye size="8vw" />,
      <Fingerprint size="8vw" />, <Cpu size="8vw" />, <HardDrive size="8vw" />, <Database size="8vw" />,
      <Server size="8vw" />, <Monitor size="8vw" />, <Laptop size="8vw" />, <Tablet size="8vw" />,
      <Printer size="8vw" />, <Mouse size="8vw" />, <Keyboard size="8vw" />, <Speaker size="8vw" />,
      <Tv size="8vw" />, <Radio size="8vw" />, <Cast size="8vw" />, <Wifi size="8vw" />,
      <Bluetooth size="8vw" />, <Battery size="8vw" />, <Plug size="8vw" />, <Lightbulb size="8vw" />,
      <Flashlight size="8vw" />, <Calculator size="8vw" />, <Calendar size="8vw" />, <Mail size="8vw" />,
      <Inbox size="8vw" />, <Send size="8vw" />, <Archive size="8vw" />, <HardHat size="8vw" />,
      <Construction size="8vw" />, <Truck size="8vw" />, <Bus size="8vw" />, <Ship size="8vw" />,
      <TramFront size="8vw" />, <CableCar size="8vw" />, <MountainSnow size="8vw" />, <TreeDeciduous size="8vw" />,
      <Clover size="8vw" />, <Flower size="8vw" />, <Dna size="8vw" />, <Atom size="8vw" />,
      <Magnet size="8vw" />, <GraduationCap size="8vw" />, <School size="8vw" />, <Library size="8vw" />,
      <Church size="8vw" />, <Hotel size="8vw" />, <Hospital size="8vw" />, <Factory size="8vw" />,
      <Warehouse size="8vw" />, <ShoppingBag size="8vw" />, <Tag size="8vw" />, <Ticket size="8vw" />,
      <Wallet size="8vw" />, <Coins size="8vw" />, <Banknote size="8vw" />, <Receipt size="8vw" />,
      <BarChart size="8vw" />, <PieChart size="8vw" />, <LineChart size="8vw" />, <AreaChart size="8vw" />,
      <Presentation size="8vw" />, <Languages size="8vw" />, <MessageSquare size="8vw" />, <MessageCircle size="8vw" />,
      <Phone size="8vw" />, <Share2 size="8vw" />, <ExternalLink size="8vw" />, <Link size="8vw" />,
      <Paperclip size="8vw" />, <Bookmark size="8vw" />, <StickyNote size="8vw" />, <Folder size="8vw" />,
      <File size="8vw" />, <Files size="8vw" />, <Image size="8vw" />, <Play size="8vw" />,
      <Pause size="8vw" />, <Square size="8vw" />, <Circle size="8vw" />, <Triangle size="8vw" />,
      <Hexagon size="8vw" />, <Pentagon size="8vw" />, <Octagon size="8vw" />, <Smile size="8vw" />,
      <Frown size="8vw" />, <Meh size="8vw" />, <Angry size="8vw" />, <Laugh size="8vw" />,
      <Ghost size="8vw" />, <Skull size="8vw" />,
      <Crown size="8vw" />, <Gem size="8vw" />, <Medal size="8vw" />, <Award size="8vw" />,
      <Badge size="8vw" />, <Check size="8vw" />, <Minus size="8vw" />, <Plus size="8vw" />,
      <Equal size="8vw" />, <Divide size="8vw" />, <Percent size="8vw" />, <Hash size="8vw" />,
      <AtSign size="8vw" />, <Command size="8vw" />, <Option size="8vw" />,
      <ArrowUp size="8vw" />, <ArrowDown size="8vw" />, <ArrowLeft size="8vw" />, <ArrowRight size="8vw" />,
      <Layout size="8vw" />, <Columns size="8vw" />, <Rows size="8vw" />, <Grid size="8vw" />,
      <List size="8vw" />, <AlignLeft size="8vw" />, <AlignCenter size="8vw" />, <AlignRight size="8vw" />,
      <AlignJustify size="8vw" />, <Bold size="8vw" />, <Italic size="8vw" />, <Underline size="8vw" />,
      <Strikethrough size="8vw" />, <Code size="8vw" />
    ];

    // Simple hash function to pick a unique icon from the pool if no keyword match
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = ((hash << 5) - hash) + label.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const poolIndex = Math.abs(hash) % iconPool.length;
    
    return iconPool[poolIndex];
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden relative" dir="rtl">
      <audio ref={drumLockAudio} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" />
      
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegistration && (
          <RegistrationScreen onComplete={handleRegistrationComplete} />
        )}
      </AnimatePresence>

      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        onProceedToPayment={() => {
          setIsInvoiceOpen(false);
          setIsPaymentOpen(true);
        }}
        cart={cart} 
        userData={userData} 
      />

      <CartModal
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onClearAll={clearCart}
        onProceedToInvoice={() => {
          setIsCartDrawerOpen(false);
          setIsInvoiceOpen(true);
        }}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        userData={userData}
        cart={cart}
        onSuccess={() => {
          setIsPaymentOpen(false);
          setShowSuccess(true);
          setCart([]);
          setIsLocked(false);
        }}
      />

      {showSuccess && (
        <SuccessScreen onBackToHome={() => setShowSuccess(false)} />
      )}

      <NotificationModal 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        notifications={notifications} 
      />
      <PlantDiagnosis 
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        paidApiKey={paidApiKey}
      />

      {!showSplash && !showRegistration && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col min-h-screen relative perspective-1000"
        >
          {/* 3D Watermark Background - Starts below diagnosis button */}
          <div className="fixed inset-0 top-[380px] pointer-events-none flex items-center justify-center overflow-hidden z-0 perspective-1000">
            <motion.div
              animate={{ 
                rotateY: [0, 5, 0, -5, 0],
                rotateX: [15, 18, 15, 12, 15],
                y: [0, -10, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-4/5 h-4/5 flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <motion.img 
                src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" 
                alt="Watermark" 
                className="w-full h-full object-contain opacity-40 scale-110"
                style={{
                  filter: 'drop-shadow(20px 20px 40px rgba(0,0,0,0.4)) drop-shadow(-10px -10px 20px rgba(255,255,255,0.05)) saturate(1.5)',
                  transform: 'translateZ(50px)'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                referrerPolicy="no-referrer"
              />
              {/* Shine Overlay */}
              <div className="absolute inset-0 overflow-hidden opacity-30 mix-blend-overlay">
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg]"
                />
              </div>
            </motion.div>
          </div>


          {/* Header */}
          <header className="bg-[#B71C1C] h-16 flex items-center justify-between px-4 shadow-2xl sticky top-0 z-[100] w-full">
            <div className="flex items-center space-x-reverse space-x-3">
              {currentLevel > 1 && (
                <motion.button 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={goBack} 
                  className="text-white p-2 hover:bg-red-800 rounded-full transition-colors shadow-inner"
                >
                  <ChevronLeft size={28} />
                </motion.button>
              )}
              <button 
                onClick={() => {
                  if (window.confirm("هل تريد إغلاق التطبيق؟")) {
                    window.close();
                    // Fallback for browsers that don't allow window.close()
                    window.location.href = "about:blank";
                  }
                }}
                className="text-white p-2 hover:bg-red-800 rounded-full transition-colors"
              >
                <Power size={26} />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="wood-carved text-3xl drop-shadow-2xl px-2">زون للخدمات الزراعية</span>
            </div>

            <div className="flex items-center space-x-reverse space-x-4">
              {cart.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="bg-yellow-500 text-red-900 px-3 py-1 rounded-full text-[10px] font-black shadow-lg flex items-center space-x-reverse space-x-1"
                >
                  <ShoppingCart size={12} />
                  <span>السلة</span>
                </motion.button>
              )}

              {/* Inflatable Shopping Cart with Golden Counter */}
              <motion.div 
                animate={isCartInflating ? { 
                  scale: [1, 1.5, 0.9, 1.1, 1],
                  rotate: [0, 15, -15, 10, 0] 
                } : isLocked ? {
                  x: [0, -2, 2, -2, 2, 0],
                  transition: { repeat: Infinity, duration: 0.5 }
                } : {}}
                transition={{ duration: 0.6 }}
                className="relative cursor-pointer group"
              >
                <div 
                  onClick={() => setIsCartDrawerOpen(true)}
                  className={`p-2 rounded-xl transition-all duration-500 ${isLocked ? 'bg-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'hover:bg-white/10 relative'}`}>
                  <ShoppingCart 
                    size={30} 
                    className={`transition-all duration-500 ${isLocked ? 'text-yellow-400 scale-110' : 'text-white'} ${cart.length > 0 ? 'animate-pulse' : ''}`} 
                  />
                  
                  {showCartHint && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 right-0 bg-yellow-500 text-red-900 px-3 py-1 rounded-lg text-[8px] font-black whitespace-nowrap shadow-xl z-50"
                    >
                      اضغط هنا للمراجعة والمواصلة
                    </motion.div>
                  )}
                </div>

                {cart.length > 0 && (
                  <motion.div 
                    key={cart.length}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-b from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-[#4A3700] text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-white/80 z-20"
                    style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(184,134,11,0.5)' }}
                  >
                    {cart.length}
                  </motion.div>
                )}

                {/* Drum Lock Visual Overlay */}
                <AnimatePresence>
                  {isLocked && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -inset-1 border-2 border-yellow-400 rounded-2xl pointer-events-none"
                    >
                      <motion.div 
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-yellow-400/10 rounded-2xl"
                      />
                      <Lock size={12} className="absolute -bottom-1 -left-1 text-yellow-400 bg-[#B71C1C] rounded-full p-0.5 border border-yellow-400 shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <button 
                onClick={() => setIsNotificationOpen(true)}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Bell size={26} />
                {notifications.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#042f22] shadow-lg z-10"
                  >
                    {notifications.length}
                  </motion.span>
                )}
              </button>
            </div>
          </header>
          
          {/* Sticky Massive Invoice Button - Frozen at top below header */}
          {cart.length > 0 && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky top-16 z-[90] w-full px-4 py-2 bg-white/80 backdrop-blur-md shadow-md"
            >
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 15px 40px rgba(37,99,235,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartDrawerOpen(true)}
                className="w-full h-20 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white rounded-3xl font-black text-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] border-4 border-white/20 flex items-center justify-center space-x-reverse space-x-4 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-shine pointer-events-none" />
                <ShoppingCart size={36} className="drop-shadow-lg" />
                <span className="drop-shadow-lg">الانتقال إلى السلة</span>
                <div className="bg-white/20 px-5 py-2 rounded-full text-xl border border-white/30">
                  {cart.length}
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Dynamic Filter Path / Royal Banner */}
          <div className="px-2 py-4 flex flex-col space-y-3 bg-transparent z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-red-800 uppercase tracking-widest">
                  {currentLevel === 1 ? 'القائمة الرئيسية' : currentLevel === 2 ? filters[0] : `${filters[0]} / ${filters[1]}`}
                </span>
              </div>
              <span className="text-gray-900 text-sm font-black tracking-tight">{userData?.name || 'زائر'}</span>
            </div>

            {/* 3D Smart Search Bar */}
            <div className="relative group perspective-1000">
              <motion.div
                animate={{
                  boxShadow: isSearchFocused 
                    ? "0 8px 0 #991B1B, 0 0 40px rgba(183, 28, 28, 0.8), 0 15px 30px rgba(0,0,0,0.3)" 
                    : "0 8px 0 #991B1B, 0 15px 20px rgba(0,0,0,0.2)",
                  rotateX: isSearchFocused ? 2 : 0,
                  y: isSearchFocused ? -2 : 0
                }}
                className={`relative w-full h-20 bg-red-600 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                  isSearchFocused ? 'border-red-400' : 'border-red-700/60'
                } shadow-[0_8px_0_#991B1B,0_15px_20px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_#991B1B,0_5px_10px_rgba(0,0,0,0.2)] active:translate-y-[6px] preserve-3d`}
              >
                {/* Pure White Laser / Pulse Effect */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isSearchFocused ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-laser-scan`} />
                </div>

                <input 
                  type="text" 
                  placeholder="ابحث عن شتول، أصائص، أسمدة، مبيدات... إلخ)" 
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-transparent px-14 text-xl font-black text-black focus:outline-none placeholder:text-black/50 placeholder:font-black placeholder:drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)] relative z-10"
                  dir="rtl"
                />

                {/* 3D Magnifying Glass Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <motion.div 
                    animate={isSearchFocused ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    className="relative"
                  >
                    <Search size={36} className="text-black drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" />
                  </motion.div>
                </div>

                {/* Pulsating Ready Indicator */}
                {isSearchFocused && (
                  <motion.div 
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8],
                      boxShadow: ["0 0 5px #22c55e", "0 0 20px #22c55e", "0 0 5px #22c55e"]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full z-20"
                  />
                )}
              </motion.div>
            </div>

            {/* General Diagnosis Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDiagnosisOpen(true)}
              className="w-full h-20 bg-[#2E7D32] text-white rounded-2xl font-black text-lg shadow-[0_8px_0_#1B5E20,0_15px_20px_rgba(0,0,0,0.2)] flex items-center justify-between px-6 border-b-2 border-white/10 relative overflow-hidden group active:shadow-[0_2px_0_#1B5E20,0_5px_10px_rgba(0,0,0,0.2)] active:translate-y-[6px] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] group-hover:animate-shine pointer-events-none" />
              <Leaf size={28} className="text-white drop-shadow-md" />
              <span className="flex-1 text-center px-4">تشخيص عام لأمراض نباتات الزينة</span>
              <Camera size={28} className="text-white drop-shadow-md" />
            </motion.button>

            {currentLevel > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] text-gray-400 font-bold"
              >
                تصفية حسب: {filters.join(' > ')}
              </motion.div>
            )}
          </div>

          {/* Notifications */}
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`fixed top-20 left-4 right-4 z-[100] p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl border-2 flex items-start space-x-reverse space-x-4 ${
                  notification.type === 'success' ? 'bg-green-600/90 border-green-400 text-white' : 
                  notification.type === 'error' ? 'bg-red-700/90 border-red-500 text-white' : 
                  'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] border-[#FFD700] text-[#4A3700]'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-black leading-relaxed drop-shadow-sm">{notification.message}</p>
                </div>
                <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid with Slide Animation */}
          <main className={`flex-1 px-4 pb-8 relative z-10 overflow-hidden ${currentLevel === 1 ? 'bg-[#F6F6F8]' : 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800'}`}>
            {/* 3D Glossy Watermark - Positioned behind content but above background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1.6 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* 3D Layers - Increased Clarity */}
                <img 
                  src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" 
                  alt="Zone Watermark Shadow" 
                  className="w-4/5 object-contain absolute blur-[5px] translate-y-8 opacity-60 grayscale"
                  referrerPolicy="no-referrer"
                />
                <motion.img 
                  src="https://i.ibb.co/3y2V0NVM/Gemini-Generated-Image-m1yvplm1yvplm1yv.png" 
                  alt="Zone Watermark Front" 
                  className="w-4/5 object-contain relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Moving Shine Effect - More Intense */}
                <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
                  <motion.div 
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                    className="w-[300%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-35deg] blur-2xl"
                  />
                </div>
              </motion.div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64 relative z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentLevel}
                  initial={{ x: 150, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -150, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className={`w-full max-w-full mx-auto pt-6 relative z-10 ${currentLevel === 1 ? 'grid grid-cols-3 gap-[4vw] px-[4vw]' : 'grid grid-cols-2 gap-x-[6vw] gap-y-12 px-[2vw]'}`}
                >
                  {currentItems.map((item: any, index) => (
                    item.type === 'level1' || item.type === 'level2' ? (
                      <div key={item.id} className={currentLevel === 1 ? '' : 'col-span-1'}>
                        <AnimatedButton 
                          icon={getIcon(item.label, index)} 
                          label={item.label} 
                          onClick={() => handleItemClick(item.label)}
                          level={currentLevel}
                          isGlossy={currentLevel === 1 && item.label === 'نباتات الزينة'}
                        />
                      </div>
                    ) : (
                      <div key={item.id} className="col-span-1">
                        <ProductCard 
                          name={item.label}
                          price={item.price}
                          image={item.image}
                          onAddToCart={() => addToCart(item)}
                        />
                      </div>
                    )
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </main>

          {/* Bottom Padding */}
          <div className="h-6 bg-transparent"></div>
        </motion.div>
      )}
    </div>
  );
}
