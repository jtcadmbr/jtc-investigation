import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { LogOut, Moon, Shield, Monitor, Download } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({ component: Page });

function Page() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <AppShell title="Configurações">
      <div className="grid gap-4 max-w-2xl">
        <div className="rounded-2xl border border-primary/20 bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-primary" size={20} />
            <h3 className="font-semibold">Conta</h3>
          </div>
          <div className="text-sm text-muted-foreground">Sessão ativa</div>
          <div className="text-sm font-mono">{user?.email}</div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-card p-5">
          <div className="flex items-center gap-3 mb-1">
            <Moon className="text-primary" size={20} />
            <h3 className="font-semibold">Aparência</h3>
          </div>
          <p className="text-sm text-muted-foreground">Modo escuro permanente (estilo cyber).</p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <Monitor className="text-primary" size={20} />
            <h3 className="font-semibold">Aplicativo Desktop (Windows)</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Rode o JTC Investigação em uma janela dedicada de alta performance sem as barras do navegador. 
            O aplicativo já vem pré-configurado com o ícone oficial do sistema.
          </p>
          <a
            href="/JTC_Investigacao.exe"
            download="JTC_Investigacao.exe"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition shadow-glow"
          >
            <Download size={14} />
            Baixar Executável (.exe)
          </a>
        </div>

        <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
          className="rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive p-5 text-left flex items-center gap-3 hover:bg-destructive/20 transition">
          <LogOut size={20} />
          <div>
            <div className="font-semibold">Sair</div>
            <div className="text-xs opacity-80">Encerrar sessão atual</div>
          </div>
        </button>

        <div className="text-xs text-muted-foreground text-center pt-4">
          JTCQI+ — Sistema fictício e organizacional.
        </div>
      </div>
    </AppShell>
  );
}
