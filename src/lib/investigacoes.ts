import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const INVESTIGACAO_STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  em_apuracao: {
    label: "Em apuração",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    dot: "bg-blue-500",
  },
  em_andamento: {
    label: "Em andamento",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    dot: "bg-cyan-500",
  },
  aguardando_informacoes: {
    label: "Aguardando informações",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dot: "bg-amber-500",
  },
  concluida: {
    label: "Concluída",
    badge: "bg-green-500/20 text-green-300 border-green-500/40",
    dot: "bg-green-500",
  },
  arquivada: {
    label: "Arquivada",
    badge: "bg-gray-500/20 text-gray-300 border-gray-500/40",
    dot: "bg-gray-500",
  },
};

export const PRIORIDADES: Record<string, { label: string; badge: string; dot: string }> = {
  baixa: {
    label: "Baixa",
    badge: "bg-gray-500/20 text-gray-300 border-gray-500/40",
    dot: "bg-gray-500",
  },
  media: {
    label: "Média",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    dot: "bg-blue-500",
  },
  alta: {
    label: "Alta",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    dot: "bg-orange-500",
  },
  critica: {
    label: "Crítica",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
    dot: "bg-red-500",
  },
};

export const RELATO_TIPOS: Record<string, string> = {
  observado_pessoalmente: "Observado pessoalmente",
  relato_testemunha: "Relato de testemunha",
  informacao_terceiro: "Informação de terceiro",
  evidencia: "Evidência",
  informacao_nao_verificada: "Informação não verificada",
};

export const VERIFICACAO: Record<string, { label: string; badge: string }> = {
  nao_verificado: {
    label: "Não verificado",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  em_verificacao: {
    label: "Em verificação",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  verificado: {
    label: "Verificado",
    badge: "bg-green-500/20 text-green-300 border-green-500/40",
  },
  descartado: {
    label: "Descartado",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
  },
};

export const EVIDENCIA_TIPOS: Record<string, string> = {
  foto: "Foto",
  video: "Vídeo",
  audio: "Áudio",
  documento: "Documento",
  outros: "Outros arquivos",
};

export const RELACOES = [
  "Vítima",
  "Suspeito",
  "Autor",
  "Testemunha",
  "Informante",
  "Envolvido",
  "Pessoa de interesse",
  "Contato",
] as const;

export const HISTORICO_TIPOS: Record<string, { label: string; dot: string }> = {
  criacao: { label: "Investigação criada", dot: "bg-primary" },
  testemunha: { label: "Testemunha adicionada", dot: "bg-blue-500" },
  relato: { label: "Relato registrado", dot: "bg-cyan-500" },
  evidencia: { label: "Evidência adicionada", dot: "bg-yellow-500" },
  camera: { label: "Câmera registrada", dot: "bg-orange-500" },
  pessoa: { label: "Pessoa relacionada", dot: "bg-green-500" },
  nota: { label: "Anotação criada", dot: "bg-fuchsia-500" },
  edicao: { label: "Registro atualizado", dot: "bg-gray-500" },
  status: { label: "Status alterado", dot: "bg-amber-500" },
  prioridade: { label: "Prioridade alterada", dot: "bg-red-500" },
};

export function fmtData(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function fmtDataHora(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Gera o próximo número sequencial no formato JTC-INV-0001.
 * O número é único por usuário (constraint unique na tabela).
 */
export async function gerarNumero(userId: string): Promise<string> {
  try {
    const { data } = await supabase.from("investigacoes").select("numero").eq("user_id", userId);
    let max = 0;
    for (const row of data ?? []) {
      const match = String(row.numero).match(/(\d+)$/);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    return `JTC-INV-${String(max + 1).padStart(4, "0")}`;
  } catch {
    return "JTC-INV-0001";
  }
}

/** Registra um evento no histórico / linha do tempo da investigação. */
export async function logHistorico(
  user: User,
  investigacao_id: string,
  tipo: string,
  descricao: string,
): Promise<void> {
  try {
    await supabase.from("investigacao_historico").insert({
      user_id: user.id,
      investigacao_id,
      tipo,
      descricao,
      usuario: user.email ?? user.id,
    });
  } catch {
    // melhor esforço — o registro principal não pode falhar por causa do log
  }
}

/** Envia um arquivo para o bucket de uploads e devolve url/path/mime. */
export async function uploadArquivo(
  user: User,
  file: File,
): Promise<{ url: string; storage_path: string; mime: string } | null> {
  try {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const path = `${user.id}/evidencia-${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage
      .from("uploads")
      .upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (up.error) return null;
    const { data: signed } = await supabase.storage
      .from("uploads")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    return { url: signed?.signedUrl ?? "", storage_path: path, mime: file.type };
  } catch {
    return null;
  }
}
