import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { LogOut, Moon, Shield, Monitor, Download, Mail, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type EmailPurpose = 'verification' | 'recovery' | 'general';

interface SmtpConfig {
  id: string;
  host: string;
  port: number;
  user_name: string;
  from_name: string;
  from_email: string;
  purpose: EmailPurpose;
  is_active: boolean;
}

export const Route = createFileRoute("/configuracoes")({ component: Page });

function Page() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [host, setHost] = useState("");
  const [port, setPort] = useState(587);
  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [purpose, setPurpose] = useState<EmailPurpose>("general");

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const { data, error } = await supabase
        .from("smtp_configs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setConfigs(data as SmtpConfig[]);
    } catch (error: any) {
      toast.error("Erro ao carregar configurações de e-mail");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!host || !user_name || !password || !fromEmail) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      const { error } = await supabase.from("smtp_configs").insert({
        user_id: user?.id,
        host,
        port,
        user_name,
        password,
        from_name: fromName,
        from_email: fromEmail,
        purpose,
      });

      if (error) throw error;
      
      toast.success("Configuração de e-mail adicionada");
      setIsAdding(false);
      resetForm();
      fetchConfigs();
    } catch (error: any) {
      toast.error("Erro ao salvar configuração: " + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta configuração de e-mail?")) return;

    try {
      const { error } = await supabase.from("smtp_configs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Configuração removida");
      fetchConfigs();
    } catch (error: any) {
      toast.error("Erro ao remover");
    }
  }

  function resetForm() {
    setHost("");
    setPort(587);
    setUserName("");
    setPassword("");
    setFromName("");
    setFromEmail("");
    setPurpose("general");
  }

  const purposeLabels: Record<EmailPurpose, string> = {
    verification: "Verificação de Conta",
    recovery: "Recuperação de Senha",
    general: "Geral / Notificações"
  };
  return (
    <AppShell title="Configurações">
      <div className="grid gap-4 max-w-2xl">
        <div className="rounded-2xl border border-primary/20 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="text-primary" size={20} />
              <h3 className="font-semibold">Servidores de E-mail (SMTP)</h3>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
            >
              <Plus size={18} />
            </button>
          </div>

          {isAdding && (
            <div className="space-y-3 mb-6 p-4 rounded-xl border border-primary/10 bg-black/20">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Host SMTP</label>
                  <input value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.exemplo.com" className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Porta</label>
                  <input type="number" value={port} onChange={e => setPort(parseInt(e.target.value))} className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Usuário / Email</label>
                  <input value={user_name} onChange={e => setUserName(e.target.value)} className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Nome Remetente</label>
                  <input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Suporte JTC" className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Email Remetente</label>
                  <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="contato@jtc.com" className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Finalidade desta conta</label>
                <select 
                  value={purpose} 
                  onChange={e => setPurpose(e.target.value as EmailPurpose)}
                  className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="general">Geral / Notificações</option>
                  <option value="verification">Verificação de Conta</option>
                  <option value="recovery">Recuperação de Senha</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleAdd} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-bold shadow-glow hover:bg-primary/90 transition">
                  SALVAR CONTA
                </button>
                <button onClick={() => { setIsAdding(false); resetForm(); }} className="px-4 py-2 border border-primary/10 rounded-lg text-xs hover:bg-primary/5 transition">
                  CANCELAR
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-primary/5 rounded"></div>
                  <div className="h-4 bg-primary/5 rounded w-5/6"></div>
                </div>
              </div>
            ) : configs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 italic">Nenhuma conta configurada.</p>
            ) : (
              configs.map(config => (
                <div key={config.id} className="flex items-center justify-between p-3 rounded-xl border border-primary/5 bg-black/10 hover:border-primary/20 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        {config.from_email}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {purposeLabels[config.purpose]}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{config.host}:{config.port}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(config.id)} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

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
            Aplicativo desktop real (Electron) para Windows 10/11 x64. Roda em janela dedicada,
            sem barras de navegador, com o ícone oficial do sistema. Baixe, extraia o .zip e execute
            <span className="font-mono"> JTC Investigacao.exe</span>.
          </p>
          <a
            href="/__l5e/assets-v1/afd090f4-1ec7-4f34-a3ec-f92d8ca6b18c/JTC_Investigacao_Desktop.zip"
            download="JTC_Investigacao_Desktop.zip"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition shadow-glow"
          >
            <Download size={14} />
            Baixar Aplicativo Windows (.zip · ~120 MB)
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
