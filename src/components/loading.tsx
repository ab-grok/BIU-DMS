export default function Loading() {
  return (
    <div className="absolute -top-[0%] -left-[0%] z-10 flex h-full w-full items-center justify-center rounded-md bg-neutral-800/80 backdrop-blur-md">
      <div className="group flex h-[20%] w-[40%] cursor-pointer items-center justify-center rounded-3xl">
        <div>
          <div className="animate-loading1 shadow-bw absolute hidden h-5 w-5 rounded-full bg-black/20 inset-shadow-xs inset-shadow-amber-50 transition-all group-hover:shadow-lg hover:scale-110"></div>
          <div className="animate-loading1 shadow-bw h-5 w-5 rounded-full bg-black inset-shadow-xs inset-shadow-amber-50 transition-all group-hover:shadow-xl hover:scale-110 hover:bg-emerald-900"></div>
        </div>
        <div className="shadow-bw h-5 w-5 rounded-full bg-slate-700 inset-shadow-xs inset-shadow-white transition-all group-hover:shadow-xl hover:scale-110 hover:bg-red-900"></div>
        <div className="shadow-bw h-5 w-5 rounded-full bg-slate-700 inset-shadow-xs inset-shadow-white transition-all group-hover:shadow-xl hover:scale-110 hover:bg-lime-700"></div>
        <div className="animate-loading3 shadow-bw h-5 w-5 rounded-full bg-slate-400 inset-shadow-xs inset-shadow-slate-300 transition-all group-hover:shadow-xl hover:scale-110 hover:bg-violet-900"></div>
      </div>
    </div>
  );
}
