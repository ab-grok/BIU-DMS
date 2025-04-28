type marker = {
  hovered: number;
  context: string;
  size?: number;
  id: string;
  n?: number;
};

export default function Marker({ hovered, context, size, id, n }: marker) {
  const sz = size ? `size-${size}` : "size-3";
  const sz2 = size ? `size-${size - 1}` : "size-2";

  return (
    <div
      className={`${sz} ${hovered == n || context?.includes(id) ? "flex" : "hidden"} flex items-center justify-center rounded-full ring-1 ring-red-800`}
    >
      <div
        className={`${sz2} ${context?.includes(id) ? "bg-red-600 shadow-xs" : "bg-red-600/10"} flex rounded-full`}
      ></div>
    </div>
  );
}
