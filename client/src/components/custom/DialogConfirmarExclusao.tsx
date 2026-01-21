import React from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeletarApontamento } from "@/hooks/use-api";
import { useInvalidateTimesheet } from "@/hooks/use-timesheet";
import { toast } from "@/hooks/use-toast";

interface DialogConfirmarExclusaoProps {
  isOpen: boolean;
  onClose: () => void;
  apontamentoId: string | null;
  atividadeNome?: string;
  podeExcluir: boolean;
}

/**
 * Dialog de confirmação para exclusão de apontamento
 * 
 * - Mostra mensagem de confirmação com nome da atividade
 * - Verifica permissão `podeExcluir` antes de permitir ação
 * - Usa `useDeletarApontamento` para chamar DELETE /api/v1/apontamentos/{id}
 * - Invalida cache do timesheet após sucesso
 * - Exibe toast de sucesso/erro
 */
export function DialogConfirmarExclusao({
  isOpen,
  onClose,
  apontamentoId,
  atividadeNome,
  podeExcluir,
}: DialogConfirmarExclusaoProps) {
  const { mutateAsync: deletarApontamento, isPending: isDeleting } = useDeletarApontamento(apontamentoId || "");
  const { invalidate } = useInvalidateTimesheet();

  const handleConfirmar = async () => {
    if (!apontamentoId || !podeExcluir) return;

    try {
      await deletarApontamento();
      
      // Invalida cache do timesheet para atualizar a grade
      invalidate();

      toast({
        title: "Apontamento excluído",
        description: atividadeNome 
          ? `O apontamento de "${atividadeNome}" foi excluído com sucesso.`
          : "O apontamento foi excluído com sucesso.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Erro desconhecido ao excluir apontamento",
        variant: "destructive",
      });
    }
  };

  // Se não pode excluir, mostra mensagem de erro
  if (!podeExcluir && isOpen) {
    return (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDE7E9]">
                <AlertTriangle className="h-5 w-5 text-[#A4262C]" />
              </div>
              <AlertDialogTitle className="text-[#201F1E]">
                Ação não permitida
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="mt-3 text-[#605E5C]">
              Não é possível excluir apontamentos de Work Items em estado <strong>Completed</strong> ou <strong>Removed</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel 
              onClick={onClose}
              className="bg-[#0078D4] text-white hover:bg-[#106EBE]"
            >
              Entendi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDE7E9]">
              <Trash2 className="h-5 w-5 text-[#A4262C]" />
            </div>
            <AlertDialogTitle className="text-[#201F1E]">
              Excluir apontamento
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-3 text-[#605E5C]">
            Tem certeza que deseja excluir este apontamento
            {atividadeNome && (
              <>
                {" "}de <strong className="text-[#323130]">"{atividadeNome}"</strong>
              </>
            )}
            ? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="border-[#C8C6C4] text-[#323130] hover:bg-[#F3F2F1]"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmar}
            disabled={isDeleting}
            className="bg-[#A4262C] text-white hover:bg-[#8B1D22] gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DialogConfirmarExclusao;
