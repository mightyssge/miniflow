import { useState, useRef } from "react";
import { MoreVertical, Pencil, Copy, Trash2 } from "lucide-react";
import { useNodeActions } from "../NodeActionsContext";
import { useClickOutside } from "../../../hooks/useClickOutside"; // Importamos el nuevo hook
import base from "./BaseNode.module.css"; 

export default function NodeMenu({ id, className }: { id: string, className?: string }) {
  const { onEdit, onDuplicate, onDelete } = useNodeActions();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Especificamos el tipo en el ref para que coincida con el hook
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Aplicamos el hook (maneja Click Outside y Escape)
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  // Helper para cerrar el menú tras una acción
  const handleAction = (action: (id: string) => void) => {
    action(id);
    setMenuOpen(false);
  };

  return (
    <div className={className} ref={menuRef}>
      <button 
        className={base.kebabBtn} 
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
      >
        <MoreVertical size={14} />
      </button>

      {menuOpen && (
        <div className={base.dropdown}>
          <button className={base.dropdownItem} onClick={() => handleAction(onEdit)}>
            <Pencil size={13} /> Editar
          </button>
          <button className={base.dropdownItem} onClick={() => handleAction(onDuplicate)}>
            <Copy size={13} /> Duplicar
          </button>
          <button className={base.dropdownItemDanger} onClick={() => handleAction(onDelete)}>
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}