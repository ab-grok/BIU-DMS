export default function Loading() {
  return (
    <div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center space-x-2 rounded-3xl backdrop-blur-xs">
      <div className="animate-loading1 h-8 w-8 rounded-full bg-black inset-shadow-xs inset-shadow-amber-50 transition-all"></div>
      <div className="animate-loading2 h-8 w-8 rounded-full bg-slate-700 inset-shadow-xs inset-shadow-white transition-all"></div>
      <div className="animate-loading3 h-8 w-8 rounded-full bg-slate-400 inset-shadow-xs inset-shadow-slate-300 transition-all"></div>
    </div>
  );
}
