import os

try:
    import lizard
except ImportError:
    print("Error: The 'lizard' library is not installed.")
    print("Please install it running: pip install lizard")
    exit(1)

def main():
    # Directorios a evaluar (Ajustar rutas según sea necesario)
    directories = [
        "src",            # Frontend React + TypeScript
        "java-engine/src" # Backend Java
    ]
    
    # Extensiones de archivo deseadas y carpetas a ignorar
    exclude_patterns = [
        "*/node_modules/*",
        "*/dist/*",
        "*/dist-java-engine/*",
        "*/target/*"
    ]

    print("Evaluando Complejidad Ciclomática (CCN)...")
    
    # Ejecuta lizard sobre los directorios
    analysis = lizard.analyze(directories, exclude_pattern=exclude_patterns)
    
    high_complexity_funcs = []
    CCN_THRESHOLD = 10 
    
    for file_info in analysis:
        for func in file_info.function_list:
            ccn = func.cyclomatic_complexity
            if ccn > CCN_THRESHOLD:
                high_complexity_funcs.append((file_info.filename, func.name, ccn))

    # Ordenar de mayor a menor complejidad
    high_complexity_funcs.sort(key=lambda x: x[2], reverse=True)

    report_path = "complejidad_reporte.txt"
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("=== Reporte de Funciones con Alta Complejidad Ciclomática (CCN) ===\n")
        f.write(f"Filtro aplicado: Solo funciones con CCN > {CCN_THRESHOLD}\n\n")
        
        if high_complexity_funcs:
            f.write(f"Total de funciones encontradas: {len(high_complexity_funcs)}\n\n")
            f.write(f"{'CCN':<5} | {'Función/Método':<40} | {'Archivo'}\n")
            f.write("-" * 120 + "\n")
            for file, func, ccn in high_complexity_funcs:
                # Truncar nombre si es muy largo para tabularlo bonito
                if len(func) > 38:
                    func = func[:35] + "..."
                f.write(f"{ccn:<5} | {func:<40} | {file}\n")
            
            f.write(f"\n" + "-" * 120 + "\n")
            f.write("* Sugerencia: Considera refactorizar estas funciones para que sean más legibles, testables y mantenibles.\n")
            print(f"Reporte generado con {len(high_complexity_funcs)} alertas de complejidad. Archivo creado: {report_path}")
        else:
            f.write("¡Excelente!\nNo se detectaron funciones con complejidad ciclomática mayor a 10 en todo el proyecto.\n")
            print(f"Reporte limpio. Archivo creado: {report_path}")

if __name__ == "__main__":
    main()
