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

    print("Evaluando tamaño de archivos en Frontend...")
    frontend_dir = "src"
    frontend_extensions = ('.ts', '.tsx', '.js', '.jsx')
    large_files = []
    
    for root, _, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith(frontend_extensions):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = sum(1 for line in f)
                        if lines > 100:
                            large_files.append((filepath, lines))
                except Exception as e:
                    print(f"No se pudo leer {filepath}: {e}")
                    
    large_files.sort(key=lambda x: x[1], reverse=True)

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
            print(f"Reporte de complejidad generado con {len(high_complexity_funcs)} alertas.")
        else:
            f.write("¡Excelente!\nNo se detectaron funciones con complejidad ciclomática mayor a 10 en todo el proyecto.\n")
            print("Reporte de complejidad limpio.")
            
        f.write("\n\n=== Reporte de Archivos Grandes en Frontend ===\n")
        f.write("Filtro aplicado: Archivos .ts, .tsx, .js, .jsx con más de 100 líneas en 'src'\n\n")
        
        if large_files:
            f.write(f"Total de archivos encontrados: {len(large_files)}\n\n")
            f.write(f"{'Líneas':<8} | {'Archivo'}\n")
            f.write("-" * 120 + "\n")
            for filepath, lines in large_files:
                f.write(f"{lines:<8} | {filepath}\n")
            f.write(f"\n" + "-" * 120 + "\n")
            f.write("* Sugerencia: Considera dividir estos archivos en componentes o hooks más pequeños o extraer utilidades.\n")
            print(f"Reporte de archivos generado con {len(large_files)} alertas.")
        else:
            f.write("¡Excelente!\nNo se detectaron archivos de frontend con más de 100 líneas.\n")
            print("Reporte de archivos grandes limpio.")
            
    print(f"Archivo de reporte creado/actualizado: {report_path}")

if __name__ == "__main__":
    main()