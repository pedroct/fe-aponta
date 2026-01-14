import React, { useState } from "react";
import { ChevronDown, Search, Filter, MoreHorizontal, Check, X, User, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- Components mimicking Azure DevOps UI ---

const ADOHeader = ({ title, children }: { title: string; children?: React.ReactNode }) => {
  return (
    <div className="bg-white border-b border-[#EAEAEA] px-6 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#201F1E]">{title}</h1>
      </div>
      {children && <div className="flex items-end gap-4">{children}</div>}
    </div>
  );
};

const ADOInput = ({ label, placeholder, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-[#201F1E]">{label}</label>}
      <div className="relative group">
        <input
          className={cn(
            "w-full h-8 px-2 text-sm border border-[#605E5C] rounded-sm hover:border-[#323130] focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-colors placeholder:text-[#605E5C]",
            className
          )}
          placeholder={placeholder}
          {...props}
        />
      </div>
    </div>
  );
};

const ADODropdown = ({ label, options, placeholder = "Select...", className, onSelect }: { label?: string; options: string[]; placeholder?: string; className?: string; onSelect?: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      {label && <label className="text-sm font-semibold text-[#201F1E]">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-8 px-2 text-sm border border-[#605E5C] rounded-sm hover:border-[#323130] focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] bg-white flex items-center justify-between text-left",
          className
        )}
      >
        <span className={selected ? "text-[#201F1E]" : "text-[#605E5C]"}>{selected || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-[#605E5C]" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#C8C6C4] shadow-lg z-50 max-h-60 overflow-auto">
          {options.map((opt) => (
            <div
              key={opt}
              className="px-3 py-2 text-sm text-[#201F1E] hover:bg-[#F3F2F1] cursor-pointer"
              onClick={() => {
                setSelected(opt);
                setIsOpen(false);
                if (onSelect) onSelect(opt);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ADOTable = ({ data, onEdit, onDelete }: { data: any[]; onEdit?: (row: any) => void; onDelete?: (row: any) => void }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#EAEAEA]">
            <th className="py-2.5 px-4 text-xs font-semibold text-[#605E5C] uppercase tracking-wider">Atividade</th>
            <th className="py-2.5 px-4 text-xs font-semibold text-[#605E5C] uppercase tracking-wider">Projeto</th>
            <th className="py-2.5 px-4 text-xs font-semibold text-[#605E5C] uppercase tracking-wider">Situação</th>
            <th className="py-2.5 px-4 text-xs font-semibold text-[#605E5C] uppercase tracking-wider">Criado por</th>
            <th className="py-2.5 px-4 text-xs font-semibold text-[#605E5C] uppercase tracking-wider text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="group hover:bg-[#F3F2F1] border-b border-[#EAEAEA] last:border-0 transition-colors">
              <td className="py-3 px-4 text-sm text-[#201F1E] font-medium">{row.activity}</td>
              <td className="py-3 px-4 text-sm text-[#201F1E]">{row.project}</td>
              <td className="py-3 px-4 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      row.status === "Ativo" ? "bg-green-600" : "bg-gray-400"
                    )}
                  />
                  <span className="text-[#201F1E]">{row.status}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-[#201F1E] flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-xs">
                    {row.createdBy.charAt(0)}
                 </div>
                 {row.createdBy}
              </td>
              <td className="py-3 px-4 text-sm text-[#201F1E] text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit && onEdit(row)}
                    className="p-1.5 hover:bg-[#E1DFDD] rounded-sm text-[#605E5C] hover:text-[#0078D4]" title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete && onDelete(row)}
                    className="p-1.5 hover:bg-[#FDE7E9] rounded-sm text-[#605E5C] hover:text-[#A80000]" title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Page Implementation ---

const MOCK_DATA = [
  { activity: "Implementação de Login", project: "Sistema Web", status: "Ativo", createdBy: "João Silva" },
  { activity: "Correção de Bugs da API", project: "Backend Core", status: "Ativo", createdBy: "Maria Souza" },
  { activity: "Atualização de Documentação", project: "Wiki Interna", status: "Inativo", createdBy: "Carlos Oliveira" },
  { activity: "Design da Home Page", project: "Sistema Web", status: "Ativo", createdBy: "Ana Pereira" },
  { activity: "Configuração de CI/CD", project: "Infraestrutura", status: "Ativo", createdBy: "Pedro Santos" },
];

export default function ActivitiesPage() {
  const { toast } = useToast();
  const [activityName, setActivityName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const handleSave = () => {
    if (!activityName.trim() || !selectedProject) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome da atividade e selecione um projeto.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Atividade registrada com sucesso!",
    });
    setActivityName("");
    // Resetting dropdown state would require lifting more state, but for mockup this is fine
  };

  const handleEdit = (row: any) => {
    toast({
      title: "Editar Atividade",
      description: `Editando a atividade: ${row.activity}`,
    });
  };

  const handleDelete = (row: any) => {
    toast({
      title: "Atividade removida",
      description: `A atividade "${row.activity}" foi excluída.`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] flex flex-col font-[Segoe UI]">
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Form Fields */}
        <ADOHeader title="Gestão de Atividades">
          <div className="flex flex-row gap-4 w-full max-w-4xl pb-1">
            <div className="flex-1">
              <ADOInput 
                label="Nome da atividade" 
                placeholder="Digite o nome da atividade" 
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
              />
            </div>
            <div className="w-64">
              <ADODropdown 
                label="Projeto" 
                options={["Sistema Web", "Backend Core", "Infraestrutura", "Wiki Interna"]} 
                placeholder="Selecione um projeto"
                onSelect={(val) => setSelectedProject(val)}
              />
            </div>
            <div className="flex items-end pb-[2px]">
              <button 
                onClick={handleSave}
                className="h-8 px-4 bg-[#0078D4] text-white text-sm font-semibold rounded-sm hover:bg-[#106EBE] flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </ADOHeader>

        <div className="p-4 md:p-8 flex-1">
          <div className="bg-white rounded shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.132),0_0.3px_0.9px_0_rgba(0,0,0,0.108)] overflow-hidden">
            {/* Toolbar for Table */}
            <div className="px-4 py-3 border-b border-[#EAEAEA] flex justify-between items-center bg-white">
              <div className="flex gap-2">
                <button className="flex items-center gap-1 text-sm text-[#201F1E] hover:bg-[#F3F2F1] px-2 py-1 rounded-sm">
                  <Filter className="w-4 h-4 text-[#0078D4]" />
                  <span>Filtrar</span>
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1.5 text-[#605E5C]" />
                <input 
                  className="h-8 pl-8 pr-4 text-sm border border-transparent hover:border-[#605E5C] focus:border-[#0078D4] rounded-sm w-48 transition-colors"
                  placeholder="Pesquisar atividades..."
                />
              </div>
            </div>
            
            {/* Table Component */}
            <div className="bg-white">
              <ADOTable data={MOCK_DATA} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
