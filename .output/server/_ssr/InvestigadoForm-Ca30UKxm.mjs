import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { u as useAuth } from "./router-CzwYCBSY.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as Cropper } from "../_libs/react-easy-crop.mjs";
import { P as PersonPicker } from "./PersonPicker-CpYbj2Xa.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { X, I as Image$1, u as Plus, T as Trash2, z as Save, B as TriangleAlert, C as Check, G as Link2Off, H as Link2, S as Search, U as Upload, J as ZoomOut, K as ZoomIn } from "../_libs/lucide-react.mjs";
async function getCroppedBlob(src, area) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const canvas = document.createElement("canvas");
  const size = Math.min(area.width, area.height);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return await new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.92));
}
function AvatarCropper({ src, onCancel, onDone }) {
  const [crop, setCrop] = reactExports.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = reactExports.useState(1);
  const [area, setArea] = reactExports.useState(null);
  const onComplete = reactExports.useCallback((_, a) => setArea(a), []);
  const save = async () => {
    if (!area) return;
    const blob = await getCroppedBlob(src, area);
    onDone(blob);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[60] bg-black/90 flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "flex items-center justify-between p-4 border-b border-primary/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold glow-text", children: "Recortar foto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "h-9 w-9 rounded-lg border border-border flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Cropper,
      {
        image: src,
        crop,
        zoom,
        aspect: 1,
        cropShape: "round",
        showGrid: false,
        onCropChange: setCrop,
        onZoomChange: setZoom,
        onCropComplete: onComplete
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-primary/20 bg-background/80 backdrop-blur space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 max-w-md mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { size: 18, className: "text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "range",
            min: 1,
            max: 4,
            step: 0.05,
            value: zoom,
            onChange: (e) => setZoom(parseFloat(e.target.value)),
            className: "flex-1 accent-[oklch(0.85_0.25_145)]"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { size: 18, className: "text-primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "px-5 py-2 rounded-lg border border-border", children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: save, className: "flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }),
          " Salvar"
        ] })
      ] })
    ] })
  ] });
}
function PhotoPicker({
  onClose,
  onPick,
  onPickFile
}) {
  const { user } = useAuth();
  const [items, setItems] = reactExports.useState([]);
  const [q, setQ] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [uploading, setUploading] = reactExports.useState(false);
  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("uploads").select("*").eq("tipo", "imagem").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data || []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  const filtered = items.filter((i) => !q || i.nome.toLowerCase().includes(q.toLowerCase()));
  const handleFiles = async (files) => {
    if (!files || !user) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    setUploading(true);
    const r = new FileReader();
    r.onload = () => {
      setUploading(false);
      onPickFile(r.result);
    };
    r.readAsDataURL(file);
  };
  const pickFromDevice = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => handleFiles(input.files);
    input.click();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      className: "bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col glow",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold glow-text", children: "Escolher foto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-9 w-9 rounded-lg border border-border flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-col sm:flex-row gap-3 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: q,
                onChange: (e) => setQ(e.target.value),
                placeholder: "Pesquisar na galeria...",
                className: "w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: pickFromDevice,
              disabled: uploading,
              className: "flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm glow disabled:opacity-60",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
                " ",
                uploading ? "Carregando..." : "Do dispositivo"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-8 text-sm", children: "Carregando galeria..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 border border-dashed border-border rounded-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "mx-auto mb-2 text-muted-foreground", size: 32 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma imagem na galeria." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: 'Use "Do dispositivo" para enviar uma nova.' })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3", children: filtered.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onPick(it.url),
            className: "group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary hover:glow transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.url, alt: it.nome, className: "w-full h-full object-cover", loading: "lazy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end p-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white opacity-0 group-hover:opacity-100 truncate", children: it.nome }) })
            ]
          },
          it.id
        )) }) })
      ]
    }
  ) });
}
function formatCPF(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 3) out = d.slice(0, 3) + "." + d.slice(3);
  if (d.length > 6) out = d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6);
  if (d.length > 9) out = d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6, 9) + "-" + d.slice(9);
  return out;
}
function isValidCPF(value) {
  const d = value.replace(/\D/g, "");
  if (d.length !== 11) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let rev = 11 - sum % 11;
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  rev = 11 - sum % 11;
  if (rev >= 10) rev = 0;
  return rev === parseInt(d[10]);
}
function formatRG(value) {
  const d = value.replace(/[^\dXx]/g, "").slice(0, 9).toUpperCase();
  let out = d;
  if (d.length > 2) out = d.slice(0, 2) + "." + d.slice(2);
  if (d.length > 5) out = d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5);
  if (d.length > 8) out = d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5, 8) + "-" + d.slice(8);
  return out;
}
function formatDateBR(value) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, 2) + "/" + d.slice(2);
  return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
}
function brToISO(value) {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = parseInt(dd), mo = parseInt(mm), y = parseInt(yyyy);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2200) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${yyyy}-${mm}-${dd}`;
}
function isoToBR(value) {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}
function calcAge(iso) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const birth = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  const now = /* @__PURE__ */ new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const mo = now.getMonth() - birth.getMonth();
  if (mo < 0 || mo === 0 && now.getDate() < birth.getDate()) age--;
  return age >= 0 && age < 150 ? age : null;
}
function formatPhoneBR(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return "(" + d;
  if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}
const BR_STATES = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"]
];
const STATUSES = ["suspeito", "investigado", "testemunha", "familiar", "contato", "desaparecido", "sem_restricao", "desconhecido"];
const FAMILY_KEYS = {
  nome_mae: "mãe",
  nome_pai: "pai",
  avo_materna: "avó materna",
  avo_materno: "avô materno",
  avo_paterna: "avó paterna",
  avo_paterno: "avô paterno",
  irmaos: "irmão",
  irmas: "irmã",
  tios: "tio",
  tias: "tia"
};
const SECTIONS = [
  {
    title: "Identificação",
    fields: [
      { key: "nome", label: "Nome completo *" },
      { key: "cpf", label: "CPF" },
      { key: "rg", label: "RG" },
      { key: "idade", label: "Idade", type: "number" },
      { key: "data_nascimento", label: "Data de nascimento (dd/mm/aaaa)" }
    ]
  },
  {
    title: "Família",
    fields: [
      { key: "nome_mae", label: "Mãe" },
      { key: "nome_pai", label: "Pai" },
      { key: "avo_materna", label: "Avó materna" },
      { key: "avo_materno", label: "Avô materno" },
      { key: "avo_paterna", label: "Avó paterna" },
      { key: "avo_paterno", label: "Avô paterno" },
      { key: "irmaos", label: "Irmãos" },
      { key: "irmas", label: "Irmãs" },
      { key: "tios", label: "Tios" },
      { key: "tias", label: "Tias" }
    ]
  },
  {
    title: "Redes sociais",
    fields: [
      { key: "instagram", label: "Instagram" },
      { key: "facebook", label: "Facebook" },
      { key: "tiktok", label: "TikTok" },
      { key: "twitter", label: "X / Twitter" },
      { key: "youtube", label: "YouTube" },
      { key: "linkedin", label: "LinkedIn" },
      { key: "outras_redes", label: "Outras redes" }
    ]
  },
  {
    title: "Notas",
    fields: [
      { key: "descricao", label: "Descrição", rows: 3 },
      { key: "observacoes", label: "Observações", rows: 3 }
    ]
  }
];
const AUTO_N_KEYS = [
  "cpf",
  "rg",
  "nome_mae",
  "nome_pai",
  "avo_materna",
  "avo_materno",
  "avo_paterna",
  "avo_paterno",
  "irmaos",
  "irmas",
  "tios",
  "tias",
  "instagram",
  "facebook",
  "tiktok",
  "twitter",
  "youtube",
  "linkedin",
  "outras_redes",
  "endereco",
  "cidade",
  "descricao",
  "observacoes"
];
function normalizeList(raw, legacy) {
  if (Array.isArray(raw) && raw.length) return raw.map((c) => ({ valor: c?.valor ?? "", obs: c?.obs ?? "" }));
  if (legacy && legacy !== "N") return [{ valor: legacy, obs: "" }];
  return [];
}
function InvestigadoForm({ initial, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = reactExports.useState(initial ?? { status: "desconhecido", pais: "Brasil", fotos: [] });
  const [telefones, setTelefones] = reactExports.useState(normalizeList(initial?.telefones, initial?.telefone));
  const [emails, setEmails] = reactExports.useState(normalizeList(initial?.emails, initial?.email));
  const [saving, setSaving] = reactExports.useState(false);
  const [cropSrc, setCropSrc] = reactExports.useState(null);
  const [cropTarget, setCropTarget] = reactExports.useState("principal");
  const [showPicker, setShowPicker] = reactExports.useState(false);
  const [pickerTarget, setPickerTarget] = reactExports.useState("principal");
  const [dataBR, setDataBR] = reactExports.useState(initial?.data_nascimento ? isoToBR(initial.data_nascimento) : "");
  const [dataObitoBR, setDataObitoBR] = reactExports.useState(initial?.data_obito ? isoToBR(initial.data_obito) : "");
  const [familyLinks, setFamilyLinks] = reactExports.useState({});
  const [linkingField, setLinkingField] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setForm(initial ?? { status: "desconhecido", pais: "Brasil", fotos: [] });
    setTelefones(normalizeList(initial?.telefones, initial?.telefone));
    setEmails(normalizeList(initial?.emails, initial?.email));
    setDataBR(initial?.data_nascimento ? isoToBR(initial.data_nascimento) : "");
    setDataObitoBR(initial?.data_obito ? isoToBR(initial.data_obito) : "");
    setFamilyLinks({});
    if (initial?.id) {
      (async () => {
        const { data } = await supabase.from("connections").select("rotulo,to_id,investigateds!connections_to_id_fkey(id,nome)").eq("from_id", initial.id);
        const map = {};
        (data || []).forEach((c) => {
          const key = Object.keys(FAMILY_KEYS).find((k) => FAMILY_KEYS[k] === c.rotulo);
          if (key && c.investigateds) map[key] = { id: c.investigateds.id, nome: c.investigateds.nome };
        });
        setFamilyLinks(map);
      })();
    }
  }, [initial]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const cpfValid = reactExports.useMemo(() => {
    if (!form.cpf || form.cpf === "N") return null;
    return isValidCPF(form.cpf);
  }, [form.cpf]);
  const onChangeCPF = (v) => set("cpf", formatCPF(v));
  const onChangeRG = (v) => set("rg", formatRG(v));
  const onChangeData = (v) => {
    const f = formatDateBR(v);
    setDataBR(f);
    const iso = brToISO(f);
    if (iso) {
      set("data_nascimento", iso);
      const age = calcAge(iso);
      if (age !== null) set("idade", age);
    } else if (f === "") {
      set("data_nascimento", "");
    }
  };
  const addTel = () => setTelefones((t) => [...t, { valor: "", obs: "" }]);
  const rmTel = (i) => setTelefones((t) => t.filter((_, idx) => idx !== i));
  const setTel = (i, patch) => setTelefones((t) => t.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  const addEmail = () => setEmails((e) => [...e, { valor: "", obs: "" }]);
  const rmEmail = (i) => setEmails((e) => e.filter((_, idx) => idx !== i));
  const setEmail = (i, patch) => setEmails((e) => e.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  const onCropped = async (blob) => {
    const target = cropTarget;
    setCropSrc(null);
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.jpg`;
    const up = await supabase.storage.from("uploads").upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (up.error) return toast.error(up.error.message);
    const { data: pub } = supabase.storage.from("uploads").getPublicUrl(path);
    const url = pub.publicUrl;
    await supabase.from("uploads").insert({
      user_id: user.id,
      nome: `foto-${form.nome || "pessoa"}-${Date.now()}.jpg`,
      tipo: "imagem",
      mime: "image/jpeg",
      tamanho: blob.size,
      storage_path: path,
      url
    });
    if (target === "extra") {
      setForm((f) => ({ ...f, fotos: [...f.fotos || [], url] }));
      toast.success("Foto adicionada");
    } else {
      set("foto_url", url);
      toast.success("Foto salva na galeria");
    }
  };
  const addFotoExtra = (url) => setForm((f) => ({ ...f, fotos: [...f.fotos || [], url] }));
  const rmFotoExtra = (i) => setForm((f) => ({ ...f, fotos: (f.fotos || []).filter((_, idx) => idx !== i) }));
  const rmDoc = (i) => setForm((f) => ({ ...f, documentos: (f.documentos || []).filter((_, idx) => idx !== i) }));
  const setDocLabel = (i, label) => setForm((f) => ({ ...f, documentos: (f.documentos || []).map((d, idx) => idx === i ? { ...d, label } : d) }));
  const uploadDoc = () => {
    if (!user) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/doc-${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("uploads").upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) return toast.error(up.error.message);
      const { data: pub } = supabase.storage.from("uploads").getPublicUrl(path);
      const url = pub.publicUrl;
      await supabase.from("uploads").insert({
        user_id: user.id,
        nome: `doc-${form.nome || "pessoa"}-${Date.now()}.${ext}`,
        tipo: "imagem",
        mime: file.type,
        tamanho: file.size,
        storage_path: path,
        url
      });
      setForm((f) => ({ ...f, documentos: [...f.documentos || [], { url, label: "" }] }));
      toast.success("Documento adicionado");
    };
    input.click();
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome?.trim()) return toast.error("Nome é obrigatório");
    setSaving(true);
    const payload = { ...form, user_id: user.id };
    payload.fotos = Array.isArray(payload.fotos) ? payload.fotos : [];
    payload.documentos = Array.isArray(payload.documentos) ? payload.documentos : [];
    if (payload.idade === "" || payload.idade == null) delete payload.idade;
    else payload.idade = Number(payload.idade);
    if (!payload.data_nascimento) delete payload.data_nascimento;
    if (!payload.obito || !payload.data_obito) payload.data_obito = null;
    for (const k of AUTO_N_KEYS) {
      const v = payload[k];
      if (v == null || String(v).trim() === "") payload[k] = "N";
    }
    if (!payload.pais || String(payload.pais).trim() === "") payload.pais = "Brasil";
    if (!payload.estado || String(payload.estado).trim() === "") payload.estado = "N";
    const tels = telefones.filter((t) => t.valor.trim() !== "");
    const ems = emails.filter((t) => t.valor.trim() !== "");
    payload.telefones = tels;
    payload.emails = ems;
    payload.telefone = tels[0]?.valor || "N";
    payload.email = ems[0]?.valor || "N";
    const res = initial?.id ? await supabase.from("investigateds").update(payload).eq("id", initial.id).select().maybeSingle() : await supabase.from("investigateds").insert(payload).select().maybeSingle();
    if (res.error || !res.data) {
      setSaving(false);
      return toast.error(res.error?.message || "Erro ao salvar");
    }
    const savedId = res.data.id;
    const familyRotulos = Object.values(FAMILY_KEYS);
    await supabase.from("connections").delete().eq("from_id", savedId).in("rotulo", familyRotulos);
    const rows = Object.entries(familyLinks).filter(([, v]) => v?.id).map(([k, v]) => ({
      user_id: user.id,
      from_id: savedId,
      to_id: v.id,
      rotulo: FAMILY_KEYS[k]
    }));
    if (rows.length) await supabase.from("connections").insert(rows);
    setSaving(false);
    toast.success("Salvo");
    onSaved();
  };
  const baseCls = "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        className: "bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col glow",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-5 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold glow-text", children: [
              initial?.id ? "Editar" : "Nova",
              " pessoa"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "flex-1 overflow-y-auto p-5 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              form.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: form.foto_url, alt: "", className: "h-20 w-20 rounded-full object-cover border-2 border-primary/50" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 rounded-full bg-muted border-2 border-primary/30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                setPickerTarget("principal");
                setShowPicker(true);
              }, className: "flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 text-primary text-sm hover:bg-primary/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 16 }),
                " ",
                form.foto_url ? "Alterar foto" : "Adicionar foto"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Fotos adicionais" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setPickerTarget("extra");
                      setShowPicker(true);
                    },
                    className: "flex items-center gap-1 text-[11px] text-primary hover:underline",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                      " adicionar foto"
                    ]
                  }
                )
              ] }),
              !form.fotos || form.fotos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2 italic", children: "Nenhuma foto adicional. Use para guardar várias fotos da mesma pessoa." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2", children: form.fotos.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group aspect-square rounded-lg overflow-hidden border border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u, alt: "", className: "w-full h-full object-cover" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => rmFotoExtra(i),
                    className: "absolute top-1 right-1 h-6 w-6 rounded-md bg-black/70 text-destructive opacity-0 group-hover:opacity-100 flex items-center justify-center",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 })
                  }
                )
              ] }, i)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Documentos (RG, CNH, etc.)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: uploadDoc,
                    className: "flex items-center gap-1 text-[11px] text-primary hover:underline",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                      " adicionar documento"
                    ]
                  }
                )
              ] }),
              !form.documentos || form.documentos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2 italic", children: "Nenhum documento. Anexe fotos de carteira de identidade, CNH, comprovantes..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2", children: form.documentos.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-background/40 overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group aspect-[4/3]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.url, alt: d.label || `Documento ${i + 1}`, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => rmDoc(i),
                      className: "absolute top-1 right-1 h-7 w-7 rounded-md bg-black/70 text-destructive opacity-0 group-hover:opacity-100 flex items-center justify-center",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    value: d.label ?? "",
                    onChange: (e) => setDocLabel(i, e.target.value),
                    placeholder: "ex: RG (frente)",
                    className: "w-full bg-transparent border-t border-border px-2 py-1.5 text-xs outline-none focus:border-primary"
                  }
                )
              ] }, i)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => set("status", s),
                  className: `px-3 py-1.5 rounded-full text-xs border uppercase tracking-wider transition ${form.status === s ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`,
                  children: s
                },
                s
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Óbito" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mt-2", children: [{ v: false, l: "Não" }, { v: true, l: "Sim" }].map((o) => {
                const active = !!form.obito === o.v;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => set("obito", o.v),
                    className: `px-4 py-1.5 rounded-full text-xs border uppercase tracking-wider transition ${active ? o.v ? "border-destructive bg-destructive/20 text-destructive glow" : "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`,
                    children: o.l
                  },
                  o.l
                );
              }) }),
              form.obito && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Data de óbito (opcional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    inputMode: "numeric",
                    placeholder: "dd/mm/aaaa",
                    value: dataObitoBR,
                    onChange: (e) => {
                      const f = formatDateBR(e.target.value);
                      setDataObitoBR(f);
                      const iso = brToISO(f);
                      if (iso) set("data_obito", iso);
                      else if (f === "") set("data_obito", null);
                    },
                    className: baseCls
                  }
                )
              ] })
            ] }),
            SECTIONS.slice(0, 1).map((sec) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionBlock,
              {
                sec,
                form,
                set,
                dataBR,
                onChangeCPF,
                onChangeRG,
                onChangeData,
                cpfValid
              },
              sec.title
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3", children: "Contato" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Telefones" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: addTel, className: "flex items-center gap-1 text-[11px] text-primary hover:underline", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                      " adicionar telefone"
                    ] })
                  ] }),
                  telefones.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2 italic", children: 'Nenhum telefone — será salvo como "N"' }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mt-2", children: telefones.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_auto] gap-2 items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        value: t.valor,
                        onChange: (e) => setTel(i, { valor: formatPhoneBR(e.target.value) }),
                        placeholder: "(00) 00000-0000",
                        inputMode: "numeric",
                        className: baseCls
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        value: t.obs ?? "",
                        onChange: (e) => setTel(i, { obs: e.target.value }),
                        placeholder: "observação (ex: antigo, recado…)",
                        className: baseCls
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => rmTel(i),
                        className: "mt-1 h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                      }
                    )
                  ] }, i)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: "E-mails" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: addEmail, className: "flex items-center gap-1 text-[11px] text-primary hover:underline", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                      " adicionar e-mail"
                    ] })
                  ] }),
                  emails.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-2 italic", children: 'Nenhum e-mail — será salvo como "N"' }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mt-2", children: emails.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_auto] gap-2 items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "email",
                        value: t.valor,
                        onChange: (e) => setEmail(i, { valor: e.target.value }),
                        placeholder: "email@exemplo.com",
                        className: baseCls
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        value: t.obs ?? "",
                        onChange: (e) => setEmail(i, { obs: e.target.value }),
                        placeholder: "observação (ex: não é mais dela)",
                        className: baseCls
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => rmEmail(i),
                        className: "mt-1 h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                      }
                    )
                  ] }, i)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Endereço (rua, número)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.endereco ?? "", onChange: (e) => set("endereco", e.target.value), className: baseCls })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Cidade" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.cidade ?? "", onChange: (e) => set("cidade", e.target.value), className: baseCls })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Estado" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.estado ?? "", onChange: (e) => set("estado", e.target.value), className: baseCls, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— selecionar —" }),
                      BR_STATES.map(([uf, nome]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: uf, children: [
                        uf,
                        " — ",
                        nome
                      ] }, uf))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: "País" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.pais ?? "Brasil", onChange: (e) => set("pais", e.target.value), className: baseCls })
                  ] })
                ] })
              ] })
            ] }),
            SECTIONS.slice(1).map((sec) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionBlock,
              {
                sec,
                form,
                set,
                dataBR,
                onChangeCPF,
                onChangeRG,
                onChangeData,
                cpfValid,
                familyLinks,
                onLinkField: (k) => setLinkingField(k),
                onUnlinkField: (k) => setFamilyLinks((p) => {
                  const n = { ...p };
                  delete n[k];
                  return n;
                })
              },
              sec.title
            ))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-t border-border flex gap-3 justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-4 py-2 rounded-lg border border-border text-sm", children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: submit, disabled: saving, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow disabled:opacity-60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 16 }),
              " ",
              saving ? "Salvando..." : "Salvar"
            ] })
          ] })
        ]
      }
    ) }),
    showPicker && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PhotoPicker,
      {
        onClose: () => setShowPicker(false),
        onPick: (url) => {
          if (pickerTarget === "extra") {
            addFotoExtra(url);
            toast.success("Foto adicionada");
          } else {
            set("foto_url", url);
            toast.success("Foto selecionada");
          }
          setShowPicker(false);
        },
        onPickFile: (dataUrl) => {
          setCropTarget(pickerTarget);
          setShowPicker(false);
          setCropSrc(dataUrl);
        }
      }
    ),
    cropSrc && /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarCropper, { src: cropSrc, onCancel: () => setCropSrc(null), onDone: onCropped }),
    linkingField && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PersonPicker,
      {
        title: `Vincular ${FAMILY_KEYS[linkingField]}`,
        excludeId: initial?.id,
        onClose: () => setLinkingField(null),
        onPick: (p) => {
          setFamilyLinks((prev) => ({ ...prev, [linkingField]: { id: p.id, nome: p.nome } }));
          setForm((f) => ({ ...f, [linkingField]: p.nome }));
          setLinkingField(null);
        }
      }
    )
  ] });
}
function SectionBlock({ sec, form, set, dataBR, onChangeCPF, onChangeRG, onChangeData, cpfValid, familyLinks, onLinkField, onUnlinkField }) {
  const baseCls = "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3", children: sec.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: sec.fields.map((f) => {
      if (f.key === "cpf") {
        const invalid = form.cpf && form.cpf !== "N" && cpfValid === false;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: f.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.cpf ?? "",
              onChange: (e) => onChangeCPF(e.target.value),
              placeholder: "000.000.000-00",
              inputMode: "numeric",
              className: `${baseCls} ${invalid ? "border-yellow-500/60" : cpfValid ? "border-green-500/60" : ""}`
            }
          ),
          form.cpf && form.cpf !== "N" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex items-center gap-1 mt-1 text-[10px] ${invalid ? "text-yellow-500" : "text-green-500"}`, children: invalid ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
            " CPF inválido (será salvo mesmo assim)"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 11 }),
            " CPF válido"
          ] }) })
        ] }, f.key);
      }
      if (f.key === "rg") {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: f.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.rg ?? "",
              onChange: (e) => onChangeRG(e.target.value),
              placeholder: "00.000.000-0",
              inputMode: "text",
              className: baseCls
            }
          )
        ] }, f.key);
      }
      if (f.key === "data_nascimento") {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: f.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: dataBR,
              onChange: (e) => onChangeData(e.target.value),
              placeholder: "dd/mm/aaaa",
              inputMode: "numeric",
              maxLength: 10,
              className: baseCls
            }
          )
        ] }, f.key);
      }
      if (f.key === "idade") {
        const auto = !!form.data_nascimento;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[11px] text-muted-foreground", children: [
            f.label,
            " ",
            auto && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "(automática)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: form.idade ?? "",
              readOnly: auto,
              onChange: (e) => set("idade", e.target.value),
              className: `${baseCls} ${auto ? "opacity-70" : ""}`
            }
          )
        ] }, f.key);
      }
      const isFamily = onLinkField && FAMILY_KEYS[f.key];
      const linked = isFamily ? familyLinks?.[f.key] : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: f.rows ? "sm:col-span-2" : "", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] text-muted-foreground", children: f.label }),
          isFamily && (linked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => onUnlinkField(f.key),
              className: "flex items-center gap-1 text-[10px] text-primary hover:text-destructive",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2Off, { size: 11 }),
                " desvincular"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => onLinkField(f.key),
              className: "flex items-center gap-1 text-[10px] text-primary hover:underline",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 11 }),
                " vincular pessoa"
              ]
            }
          ))
        ] }),
        f.rows ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            rows: f.rows,
            value: form[f.key] ?? "",
            onChange: (e) => set(f.key, e.target.value),
            className: baseCls
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: f.type || "text",
            value: form[f.key] ?? "",
            onChange: (e) => set(f.key, e.target.value),
            className: `${baseCls} ${linked ? "border-primary/60 pr-8" : ""}`
          }
        ),
        linked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1 text-[10px] text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 10 }),
          " vinculado a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: linked.nome })
        ] })
      ] }, f.key);
    }) })
  ] });
}
export {
  InvestigadoForm as I
};
