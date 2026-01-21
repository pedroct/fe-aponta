import React, { useState } from "react";
import { Pencil, Trash2, Plus, Clock, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CelulaDia, ApontamentoDia } from "@/lib/timesheet-types";
import { useDeletarApontamento } from "@/hooks/use-api";
import { useInvalidateTimesheet } from "@/hooks/use-timesheet";
import { toast } from "@/hooks/use-toast";

interface CelulaApontamentoProps {
  celula: CelulaDia;
  workItemId: number;
  workItemTitle: string;
  podeEditar: boolean;
  podeExcluir: boolean;
  onNovoApontamento: (workItemId: number, workItemTitle: string, data: string) => void;
  onEditarApontamento: (apontamento: ApontamentoDia, workItemId: number, workItemTitle: string, data: string) => void;
  onExcluirApontamento: (apontamentoId: string, atividadeNome: string) => void;
}

/**
 * Componente de célula para a grade do Timesheet
 * 
 * Funcionalidades:
 * - Destaque visual para dia atual (azul), fim de semana (cinza) e com horas (amarelo)
 * - Clique em célula vazia: abre modal de criação
 * - Clique em célula com 1 apontamento: abre modal de edição
 * - Clique em célula com múltiplos apontamentos: mostra popover com lista e opções
 */
export function CelulaApontamento({
  celula,
  workItemId,
  workItemTitle,
  podeEditar,
  podeExcluir,
  onNovoApontamento,
  onEditarApontamento,
  onExcluirApontamento,
}: CelulaApontamentoProps) {
  const temApontamentos = celula.apontamentos.length > 0;
  const multiplosApontamentos = celula.apontamentos.length > 1;

  // Classes base da célula
  const celulaClasses = cn(
    "w-full h-full py-3 cursor-pointer transition-all text-[12px] relative",
    // Com horas registradas
    temApontamentos && "text-[#201F1E] font-black bg-[#FFF4CE] hover:bg-[#FFE8A3] shadow-inner",
    // Dia atual sem horas
    !temApontamentos && celula.eh_hoje && "bg-[#DEECF9] hover:bg-[#C7E0F4]",
    // Fim de semana sem horas
    !temApontamentos && celula.eh_fim_semana && !celula.eh_hoje && "bg-[#F3F2F1] hover:bg-[#E1DFDD]",
    // Dia normal sem horas
    !temApontamentos && !celula.eh_hoje && !celula.eh_fim_semana && "hover:bg-[#F3F2F1]",
    // Work item bloqueado
    !podeEditar && "opacity-60 cursor-not-allowed"
  );

  // Handler para clique na célula
  const handleCelulaClick = () => {
    if (!podeEditar) return;
    
    // Sem apontamentos: criar novo
    if (!temApontamentos) {
      onNovoApontamento(workItemId, workItemTitle, celula.data);
      return;
    }
    
    // Um apontamento: editar diretamente
    if (!multiplosApontamentos) {
      onEditarApontamento(celula.apontamentos[0], workItemId, workItemTitle, celula.data);
      return;
    }
    
    // Múltiplos: o popover será acionado pelo trigger
  };

  // Conteúdo da célula
  const CelulaConteudo = (
    <div 
      className={celulaClasses}
      onClick={!multiplosApontamentos ? handleCelulaClick : undefined}
    >
      {/* Valor das horas */}
      {temApontamentos && celula.total_formatado}
      
      {/* Indicador de múltiplos apontamentos */}
      {multiplosApontamentos && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0078D4]" title={`${celula.apontamentos.length} apontamentos`} />
      )}
      
      {/* Borda especial para dia atual com work item em progresso */}
      {celula.eh_hoje && !temApontamentos && podeEditar && (
        <div className="absolute inset-0 border-2 border-[#0078D4]/30 pointer-events-none" />
      )}
    </div>
  );

  // Se múltiplos apontamentos, renderiza com Popover controlado
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleEditarComFechamento = (apontamento: ApontamentoDia) => {
    setIsPopoverOpen(false);
    onEditarApontamento(apontamento, workItemId, workItemTitle, celula.data);
  };

  const handleNovoComFechamento = () => {
    setIsPopoverOpen(false);
    onNovoApontamento(workItemId, workItemTitle, celula.data);
  };

  if (multiplosApontamentos && podeEditar) {
    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          {CelulaConteudo}
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 bg-white shadow-xl border border-[#C8C6C4]" 
          align="center"
          sideOffset={4}
        >
          <PopoverApontamentos
            celula={celula}
            workItemId={workItemId}
            workItemTitle={workItemTitle}
            podeEditar={podeEditar}
            podeExcluir={podeExcluir}
            onNovoApontamento={handleNovoComFechamento}
            onEditarApontamento={handleEditarComFechamento}
            onClosePopover={() => setIsPopoverOpen(false)}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return CelulaConteudo;
}

/**
 * Conteúdo do Popover para células com múltiplos apontamentos
 * Agora com confirmação de exclusão inline (sem abrir outro modal)
 */
interface PopoverApontamentosProps {
  celula: CelulaDia;
  workItemId: number;
  workItemTitle: string;
  podeEditar: boolean;
  podeExcluir: boolean;
  onNovoApontamento: () => void;
  onEditarApontamento: (apontamento: ApontamentoDia) => void;
  onClosePopover: () => void;
}

function PopoverApontamentos({
  celula,
  workItemId,
  workItemTitle,
  podeEditar,
  podeExcluir,
  onNovoApontamento,
  onEditarApontamento,
  onClosePopover,
}: PopoverApontamentosProps) {
  // Estado para controlar qual apontamento está em modo de confirmação de exclusão
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  
  const { invalidate } = useInvalidateTimesheet();

  // Formatar data para exibição
  const dataFormatada = new Date(celula.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });

  // Handler para confirmar exclusão
  const handleConfirmarExclusao = async (apontamentoId: string, atividadeNome: string) => {
    setExcluindoId(apontamentoId);
    try {
      const response = await fetch(`/api/v1/apontamentos/${apontamentoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir apontamento');
      }
      
      invalidate();
      
      toast({
        title: "Apontamento excluído",
        description: atividadeNome 
          ? `O apontamento de "${atividadeNome}" foi excluído com sucesso.`
          : "O apontamento foi excluído com sucesso.",
      });
      
      // Se era o último apontamento, fecha o popover
      if (celula.apontamentos.length <= 1) {
        onClosePopover();
      }
      
      setConfirmandoExclusaoId(null);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Erro desconhecido ao excluir apontamento",
        variant: "destructive",
      });
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#EDEBE9] bg-[#FAF9F8]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#323130] capitalize">{dataFormatada}</span>
          <span className="text-xs font-bold text-[#0078D4]">{celula.total_formatado}</span>
        </div>
        <p className="text-[10px] text-[#605E5C] truncate mt-0.5">#{workItemId} {workItemTitle}</p>
      </div>

      {/* Lista de apontamentos */}
      <div className="max-h-48 overflow-y-auto">
        {celula.apontamentos.map((apontamento) => {
          const estaConfirmando = confirmandoExclusaoId === apontamento.id;
          const estaExcluindo = excluindoId === apontamento.id;
          
          return (
            <div
              key={apontamento.id}
              className={cn(
                "px-3 py-2 border-b border-[#EDEBE9] last:border-b-0 transition-colors",
                estaConfirmando ? "bg-[#FDE7E9]" : "hover:bg-[#F3F2F1]"
              )}
            >
              {estaConfirmando ? (
                // Modo de confirmação de exclusão inline
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Trash2 size={14} className="text-[#A4262C] flex-shrink-0" />
                    <span className="text-xs text-[#A4262C] font-medium">
                      Excluir "{apontamento.atividade_nome}"?
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 border-[#C8C6C4]"
                      onClick={() => setConfirmandoExclusaoId(null)}
                      disabled={estaExcluindo}
                    >
                      <X size={10} className="mr-1" />
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 text-[10px] px-2 bg-[#A4262C] hover:bg-[#8B1D22]"
                      onClick={() => handleConfirmarExclusao(apontamento.id, apontamento.atividade_nome)}
                      disabled={estaExcluindo}
                    >
                      {estaExcluindo ? (
                        <>
                          <Loader2 size={10} className="mr-1 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <Trash2 size={10} className="mr-1" />
                          Confirmar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo normal de exibição
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-[#605E5C] flex-shrink-0" />
                      <span className="text-xs font-bold text-[#323130]">{apontamento.duracao}</span>
                      <span className="text-[10px] text-[#605E5C] truncate">
                        {apontamento.atividade_nome}
                      </span>
                    </div>
                    {apontamento.comentario && (
                      <p className="text-[10px] text-[#A19F9D] truncate mt-0.5 pl-5">
                        {apontamento.comentario}
                      </p>
                    )}
                  </div>
                  
                  {/* Ações */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {podeEditar && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-[#DEECF9]"
                        onClick={() => onEditarApontamento(apontamento)}
                        title="Editar apontamento"
                      >
                        <Pencil size={12} className="text-[#0078D4]" />
                      </Button>
                    )}
                    {podeExcluir && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-[#FDE7E9]"
                        onClick={() => setConfirmandoExclusaoId(apontamento.id)}
                        title="Excluir apontamento"
                      >
                        <Trash2 size={12} className="text-[#A4262C]" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: botão adicionar mais */}
      {podeEditar && (
        <div className="px-3 py-2 border-t border-[#EDEBE9] bg-[#FAF9F8]">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs text-[#0078D4] hover:bg-[#DEECF9] gap-1"
            onClick={() => onNovoApontamento()}
          >
            <Plus size={12} />
            Adicionar mais horas
          </Button>
        </div>
      )}
    </div>
  );
}

export default CelulaApontamento;
