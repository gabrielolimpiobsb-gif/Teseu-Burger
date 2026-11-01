import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#141414] text-[#F2ECDD]">
      <h2 className="text-3xl font-display uppercase text-[#F5CB5C] mb-2">404 - Página Não Encontrada</h2>
      <p className="text-neutral-400 mb-6 max-w-md">
        Esta oferenda não existe ou foi consumida pelos deuses do Olimpo.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 gold-gradient-bg text-[#0B0B0B] font-display font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-md"
      >
        Voltar ao Cardápio
      </Link>
    </div>
  );
}
