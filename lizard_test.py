import lizard
import sys

with open("lizard_out.txt", "w") as f:
    file_path = "src/views/pages/WorkflowEditor.tsx"
    analysis = lizard.analyze_file(file_path)
    for func in analysis.function_list:
        f.write(f"Name: {func.name}, CCN: {func.cyclomatic_complexity}, Lines: {func.start_line}-{func.end_line}\n")
