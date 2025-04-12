export default function Loading() {
  return (
    <div className="absolute -top-[5%] -left-[5%] z-10 flex h-[110%] w-[110%] items-center justify-center rounded-3xl bg-neutral-800/80 backdrop-blur-lg">
      <div className="animate-loading1 shadow-bw h-5 w-5 rounded-full bg-black inset-shadow-xs inset-shadow-amber-50 transition-all hover:shadow-lg"></div>
      <div className="shadow-bw h-5 w-5 rounded-full bg-slate-700 inset-shadow-xs inset-shadow-white transition-all hover:shadow-lg"></div>
      <div className="animate-loading3 shadow-bw h-5 w-5 rounded-full bg-slate-400 inset-shadow-xs inset-shadow-slate-300 transition-all hover:shadow-lg"></div>
    </div>
  );
}
