#!/usr/bin/env python3
"""
🚀 Canvas LMS Codebase Performance Auditor
A comprehensive tool to analyze Next.js + FastAPI codebases for performance issues,
logic errors, and optimization opportunities.

Usage: python codebase_auditor.py [project_path]
"""

import os
import re
import ast
import json
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import subprocess
import sys

@dataclass
class Issue:
    """Represents a code issue found during analysis"""
    severity: str  # 'critical', 'warning', 'info'
    category: str  # 'performance', 'logic', 'maintainability'
    message: str
    suggestion: str
    line_number: Optional[int] = None
    code_snippet: Optional[str] = None

@dataclass
class FileAnalysis:
    """Analysis results for a single file"""
    file_path: str
    file_size: int
    line_count: int
    issues: List[Issue] = field(default_factory=list)
    complexity_score: int = 0
    import_count: int = 0
    export_count: int = 0

@dataclass
class ProjectAnalysis:
    """Complete project analysis results"""
    files: List[FileAnalysis] = field(default_factory=list)
    overall_score: int = 0
    total_issues: int = 0
    critical_issues: int = 0
    warning_issues: int = 0
    info_issues: int = 0

class CodebaseAuditor:
    """Main auditor class for analyzing full-stack codebases"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.analysis = ProjectAnalysis()
        
        # File patterns to analyze
        self.frontend_patterns = ['*.tsx', '*.jsx', '*.ts', '*.js']
        self.backend_patterns = ['*.py']
        self.config_patterns = ['*.json', '*.yaml', '*.yml']
        
        # Performance anti-patterns
        self.frontend_antipatterns = {
            'infinite_useEffect': r'useEffect\s*\([^,]+,\s*\[[^\]]*\]\s*\)',
            'missing_deps': r'useEffect\s*\([^,]+,\s*\[\s*\]\s*\)',
            'heavy_imports': r'import\s+.*\s+from\s+[\'"](?:chart\.js|lodash|moment|@mui)[\'"]',
            'blocking_fetch': r'(?:fetch|axios)\s*\([^)]*\)(?!\s*\.catch)',
            'console_logs': r'console\.(log|warn|error|debug)',
            'inline_styles': r'style\s*=\s*\{\{[^}]+\}\}',
            'large_components': None,  # Handled separately
            'missing_memo': r'export\s+(?:default\s+)?function\s+\w+.*\{',
            'prop_drilling': r'props\.\w+\.\w+\.\w+',
        }
        
        self.backend_antipatterns = {
            'missing_async': r'def\s+\w+\([^)]*\):\s*\n(?:\s*"""[^"]*"""\s*\n)?\s*(?:requests|httpx)\.',
            'no_timeout': r'(?:requests|httpx)\.(?:get|post|put|delete)\([^)]*\)(?![^)]*timeout)',
            'synchronous_db': r'(?:cursor\.execute|session\.query|db\.session)',
            'missing_error_handling': r'(?:requests|httpx|fetch)\.(?:get|post|put|delete)\([^)]*\)(?!\s*(?:\.catch|except))',
            'no_caching': r'@app\.(?:get|post|put|delete)\([\'"][^\'"]*[\'"](?![^)]*cache)',
            'blocking_operations': r'(?:time\.sleep|threading\.)',
            'print_statements': r'print\s*\(',
            'hardcoded_values': r'(?:localhost|127\.0\.0\.1|3000|8000)(?!["\'\w])',
        }

    def analyze_project(self) -> ProjectAnalysis:
        """Analyze the entire project and return results"""
        print(f"🔍 Starting codebase analysis for: {self.project_path}")
        
        # Analyze different file types
        self._analyze_frontend_files()
        self._analyze_backend_files()
        self._analyze_config_files()
        
        # Calculate overall metrics
        self._calculate_overall_score()
        
        print(f"✅ Analysis complete! Found {self.analysis.total_issues} issues across {len(self.analysis.files)} files")
        return self.analysis

    def _analyze_frontend_files(self):
        """Analyze frontend TypeScript/JavaScript files"""
        print("📱 Analyzing frontend files...")
        
        frontend_dirs = ['app', 'components', 'hooks', 'lib', 'utils', 'pages', 'src']
        for dir_name in frontend_dirs:
            dir_path = self.project_path / dir_name
            if dir_path.exists():
                self._analyze_directory(dir_path, self.frontend_patterns, 'frontend')

    def _analyze_backend_files(self):
        """Analyze backend Python files"""
        print("🔧 Analyzing backend files...")
        
        backend_dirs = ['backend', 'api', 'server', 'scripts']
        for dir_name in backend_dirs:
            dir_path = self.project_path / dir_name
            if dir_path.exists():
                self._analyze_directory(dir_path, self.backend_patterns, 'backend')

    def _analyze_config_files(self):
        """Analyze configuration files"""
        print("⚙️ Analyzing configuration files...")
        
        config_files = ['package.json', 'next.config.js', 'tsconfig.json', 'requirements.txt']
        for file_name in config_files:
            file_path = self.project_path / file_name
            if file_path.exists():
                self._analyze_file(file_path, 'config')

    def _analyze_directory(self, directory: Path, patterns: List[str], file_type: str):
        """Recursively analyze files in a directory"""
        for pattern in patterns:
            for file_path in directory.rglob(pattern):
                if self._should_analyze_file(file_path):
                    self._analyze_file(file_path, file_type)

    def _should_analyze_file(self, file_path: Path) -> bool:
        """Check if file should be analyzed (exclude node_modules, .git, etc.)"""
        exclude_dirs = {'.git', 'node_modules', '.next', '__pycache__', 'dist', 'build', '.vscode'}
        return not any(part in exclude_dirs for part in file_path.parts)

    def _analyze_file(self, file_path: Path, file_type: str):
        """Analyze a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            file_analysis = FileAnalysis(
                file_path=str(file_path.relative_to(self.project_path)),
                file_size=len(content),
                line_count=len(content.splitlines())
            )
            
            # Analyze based on file type
            if file_type == 'frontend':
                self._analyze_frontend_file(content, file_analysis)
            elif file_type == 'backend':
                self._analyze_backend_file(content, file_analysis)
            elif file_type == 'config':
                self._analyze_config_file(content, file_analysis, file_path)
            
            # Calculate complexity score
            file_analysis.complexity_score = self._calculate_complexity_score(file_analysis)
            
            self.analysis.files.append(file_analysis)
            
        except Exception as e:
            print(f"⚠️ Error analyzing {file_path}: {e}")

    def _analyze_frontend_file(self, content: str, file_analysis: FileAnalysis):
        """Analyze frontend TypeScript/JavaScript file"""
        lines = content.splitlines()
        
        # Count imports and exports
        file_analysis.import_count = len(re.findall(r'^import\s+', content, re.MULTILINE))
        file_analysis.export_count = len(re.findall(r'^export\s+', content, re.MULTILINE))
        
        # Check for performance anti-patterns
        self._check_frontend_antipatterns(content, lines, file_analysis)
        
        # Check file size issues
        if file_analysis.file_size > 10000:  # 10KB threshold
            file_analysis.issues.append(Issue(
                severity='warning',
                category='performance',
                message=f'Large file size: {file_analysis.file_size:,} bytes',
                suggestion='Consider splitting into smaller components or using dynamic imports'
            ))
        
        # Check for too many imports
        if file_analysis.import_count > 15:
            file_analysis.issues.append(Issue(
                severity='warning',
                category='maintainability',
                message=f'High import count: {file_analysis.import_count}',
                suggestion='Consider refactoring to reduce dependencies'
            ))

    def _analyze_backend_file(self, content: str, file_analysis: FileAnalysis):
        """Analyze backend Python file"""
        lines = content.splitlines()
        
        # Count imports
        file_analysis.import_count = len(re.findall(r'^(?:import|from)\s+', content, re.MULTILINE))
        
        # Check for performance anti-patterns
        self._check_backend_antipatterns(content, lines, file_analysis)
        
        # Check for function complexity
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    if len(node.body) > 20:  # Long function
                        file_analysis.issues.append(Issue(
                            severity='warning',
                            category='maintainability',
                            message=f'Long function: {node.name} ({len(node.body)} statements)',
                            suggestion='Consider breaking into smaller functions',
                            line_number=node.lineno
                        ))
        except SyntaxError:
            pass  # Skip files with syntax errors

    def _analyze_config_file(self, content: str, file_analysis: FileAnalysis, file_path: Path):
        """Analyze configuration files"""
        file_name = file_path.name
        
        if file_name == 'package.json':
            self._analyze_package_json(content, file_analysis)
        elif file_name == 'next.config.js':
            self._analyze_next_config(content, file_analysis)
        elif file_name == 'requirements.txt':
            self._analyze_requirements(content, file_analysis)

    def _analyze_next_config(self, content: str, file_analysis: FileAnalysis):
        """Analyze next.config.js for optimization opportunities"""
        # Check for missing optimizations
        optimizations = {
            'experimental': 'Missing experimental optimizations',
            'compress': 'Missing compression settings',
            'swcMinify': 'Consider enabling SWC minification',
            'images': 'Missing image optimization config'
        }
        
        for opt, message in optimizations.items():
            if opt not in content:
                file_analysis.issues.append(Issue(
                    severity='info',
                    category='performance',
                    message=message,
                    suggestion=f'Add {opt} configuration for better performance'
                ))

    def _analyze_requirements(self, content: str, file_analysis: FileAnalysis):
        """Analyze requirements.txt for optimization opportunities"""
        lines = content.strip().split('\n')
        
        # Check for unpinned versions
        unpinned = [line for line in lines if line and '==' not in line and '>=' not in line and not line.startswith('#')]
        if unpinned:
            file_analysis.issues.append(Issue(
                severity='warning',
                category='maintainability',
                message=f'Unpinned dependencies: {len(unpinned)}',
                suggestion='Pin dependency versions for reproducible builds'
            ))
        
        # Check for heavy packages
        heavy_packages = ['tensorflow', 'torch', 'opencv', 'pandas', 'numpy']
        for line in lines:
            for package in heavy_packages:
                if package in line.lower():
                    file_analysis.issues.append(Issue(
                        severity='info',
                        category='performance',
                        message=f'Heavy package detected: {package}',
                        suggestion=f'Ensure {package} is actually needed for production'
                    ))

    def _analyze_package_json(self, content: str, file_analysis: FileAnalysis):
        """Analyze package.json for optimization opportunities"""
        try:
            package_data = json.loads(content)
            
            # Check for heavy dependencies
            heavy_deps = ['lodash', 'moment', 'jquery', '@mui/material']
            dependencies = {**package_data.get('dependencies', {}), **package_data.get('devDependencies', {})}
            
            for dep in heavy_deps:
                if dep in dependencies:
                    file_analysis.issues.append(Issue(
                        severity='info',
                        category='performance',
                        message=f'Heavy dependency detected: {dep}',
                        suggestion=f'Consider lightweight alternatives for {dep}'
                    ))
            
            # Check for outdated scripts
            scripts = package_data.get('scripts', {})
            if 'build' not in scripts:
                file_analysis.issues.append(Issue(
                    severity='warning',
                    category='maintainability',
                    message='Missing build script',
                    suggestion='Add build script for production deployment'
                ))
                
        except json.JSONDecodeError:
            file_analysis.issues.append(Issue(
                severity='critical',
                category='logic',
                message='Invalid JSON syntax',
                suggestion='Fix JSON syntax errors'
            ))

    def _check_frontend_antipatterns(self, content: str, lines: List[str], file_analysis: FileAnalysis):
        """Check for frontend performance anti-patterns"""
        
        # useEffect infinite loop detection
        useeffect_matches = re.finditer(r'useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*\}\s*,\s*\[([^\]]*)\]\s*\)', content, re.DOTALL)
        for match in useeffect_matches:
            deps = match.group(1).strip()
            if not deps or 'state' in deps or 'props' in deps:
                line_num = content[:match.start()].count('\n') + 1
                file_analysis.issues.append(Issue(
                    severity='critical',
                    category='logic',
                    message='Potential infinite useEffect loop',
                    suggestion='Check dependencies array - avoid state/props that change every render',
                    line_number=line_num
                ))
        
        # Missing error boundaries
        if 'useEffect' in content and 'catch' not in content and 'try' not in content:
            file_analysis.issues.append(Issue(
                severity='warning',
                category='logic',
                message='useEffect without error handling',
                suggestion='Add try-catch blocks or error boundaries'
            ))
        
        # Blocking fetch calls
        fetch_matches = re.finditer(r'(?:fetch|axios)\s*\([^)]*\)(?!\s*\.catch)', content)
        for match in fetch_matches:
            line_num = content[:match.start()].count('\n') + 1
            file_analysis.issues.append(Issue(
                severity='warning',
                category='performance',
                message='Fetch call without error handling',
                suggestion='Add .catch() or try-catch for error handling',
                line_number=line_num
            ))
        
        # Console statements in production
        console_matches = re.finditer(r'console\.(log|warn|error|debug)', content)
        for match in console_matches:
            line_num = content[:match.start()].count('\n') + 1
            file_analysis.issues.append(Issue(
                severity='info',
                category='maintainability',
                message='Console statement found',
                suggestion='Remove console statements for production',
                line_number=line_num
            ))
        
        # Heavy imports that should be dynamic
        heavy_imports = ['chart.js', 'recharts', '@mui', 'antd']
        for heavy_import in heavy_imports:
            if re.search(f'import.*{heavy_import}', content):
                file_analysis.issues.append(Issue(
                    severity='warning',
                    category='performance',
                    message=f'Heavy import: {heavy_import}',
                    suggestion=f'Consider dynamic import for {heavy_import}: dynamic(() => import("{heavy_import}"))'
                ))

    def _check_backend_antipatterns(self, content: str, lines: List[str], file_analysis: FileAnalysis):
        """Check for backend performance anti-patterns"""
        
        # Missing async/await for HTTP calls
        http_calls = re.finditer(r'(?:requests|httpx)\.(?:get|post|put|delete)', content)
        for match in http_calls:
            line_num = content[:match.start()].count('\n') + 1
            line_content = lines[line_num - 1] if line_num <= len(lines) else ""
            
            if 'async' not in line_content and 'await' not in line_content:
                file_analysis.issues.append(Issue(
                    severity='warning',
                    category='performance',
                    message='Synchronous HTTP call',
                    suggestion='Use async/await with httpx for better performance',
                    line_number=line_num
                ))
        
        # Missing timeout in HTTP calls
        if re.search(r'(?:requests|httpx)\.(?:get|post|put|delete)\([^)]*\)', content):
            if 'timeout' not in content:
                file_analysis.issues.append(Issue(
                    severity='warning',
                    category='performance',
                    message='HTTP calls without timeout',
                    suggestion='Add timeout parameter to prevent hanging requests'
                ))
        
        # Missing caching decorators
        route_matches = re.finditer(r'@app\.(?:get|post|put|delete)', content)
        for match in route_matches:
            line_num = content[:match.start()].count('\n') + 1
            # Check next few lines for caching
            check_lines = lines[line_num:line_num + 5] if line_num < len(lines) else []
            has_cache = any('cache' in line.lower() or '@lru_cache' in line for line in check_lines)
            
            if not has_cache and '@app.get' in match.group():
                file_analysis.issues.append(Issue(
                    severity='info',
                    category='performance',
                    message='GET route without caching',
                    suggestion='Consider adding caching decorator for GET endpoints',
                    line_number=line_num
                ))
        
        # Print statements
        print_matches = re.finditer(r'print\s*\(', content)
        for match in print_matches:
            line_num = content[:match.start()].count('\n') + 1
            file_analysis.issues.append(Issue(
                severity='info',
                category='maintainability',
                message='Print statement found',
                suggestion='Use logging instead of print statements',
                line_number=line_num
            ))

    def _calculate_complexity_score(self, file_analysis: FileAnalysis) -> int:
        """Calculate complexity score for a file (0-100)"""
        score = 100
        
        # Deduct points for issues
        for issue in file_analysis.issues:
            if issue.severity == 'critical':
                score -= 20
            elif issue.severity == 'warning':
                score -= 10
            elif issue.severity == 'info':
                score -= 5
        
        # Deduct for file size
        if file_analysis.file_size > 20000:  # 20KB
            score -= 15
        elif file_analysis.file_size > 10000:  # 10KB
            score -= 10
        
        # Deduct for high import count
        if file_analysis.import_count > 20:
            score -= 10
        elif file_analysis.import_count > 15:
            score -= 5
        
        return max(0, score)

    def _calculate_overall_score(self):
        """Calculate overall project score and issue counts"""
        if not self.analysis.files:
            return
        
        # Count issues by severity
        for file_analysis in self.analysis.files:
            for issue in file_analysis.issues:
                self.analysis.total_issues += 1
                if issue.severity == 'critical':
                    self.analysis.critical_issues += 1
                elif issue.severity == 'warning':
                    self.analysis.warning_issues += 1
                elif issue.severity == 'info':
                    self.analysis.info_issues += 1
        
        # Calculate overall score (average of all file scores)
        total_score = sum(file.complexity_score for file in self.analysis.files)
        self.analysis.overall_score = total_score // len(self.analysis.files)

    def generate_report(self, output_file: str = 'performance_audit.md'):
        """Generate comprehensive Markdown report"""
        output_path = self.project_path / output_file
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(self._generate_report_content())
        
        print(f"📄 Report generated: {output_path}")
        return output_path

    def _generate_report_content(self) -> str:
        """Generate the actual report content"""
        report = []
        
        # Header
        report.append("# 🚀 Canvas LMS Codebase Performance Audit Report")
        report.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"**Project Path:** `{self.project_path}`")
        report.append("")
        
        # Executive Summary
        report.append("## 📊 Executive Summary")
        report.append("")
        report.append(f"| Metric | Value |")
        report.append(f"|--------|-------|")
        report.append(f"| **Overall Score** | {self.analysis.overall_score}/100 |")
        report.append(f"| **Total Files Analyzed** | {len(self.analysis.files)} |")
        report.append(f"| **Total Issues Found** | {self.analysis.total_issues} |")
        report.append(f"| **Critical Issues** | {self.analysis.critical_issues} 🔴 |")
        report.append(f"| **Warning Issues** | {self.analysis.warning_issues} 🟡 |")
        report.append(f"| **Info Issues** | {self.analysis.info_issues} 🔵 |")
        report.append("")
        
        # Score interpretation
        if self.analysis.overall_score >= 90:
            report.append("✅ **Excellent** - Your codebase is well-optimized!")
        elif self.analysis.overall_score >= 75:
            report.append("🟢 **Good** - Minor optimizations recommended")
        elif self.analysis.overall_score >= 60:
            report.append("🟡 **Fair** - Several performance improvements needed")
        elif self.analysis.overall_score >= 40:
            report.append("🟠 **Poor** - Significant optimization required")
        else:
            report.append("🔴 **Critical** - Major performance issues detected")
        
        report.append("")
        
        # Priority Issues
        critical_files = [f for f in self.analysis.files if any(i.severity == 'critical' for i in f.issues)]
        if critical_files:
            report.append("## 🚨 Critical Issues Requiring Immediate Attention")
            report.append("")
            for file_analysis in critical_files:
                critical_issues = [i for i in file_analysis.issues if i.severity == 'critical']
                report.append(f"### 📄 `{file_analysis.file_path}`")
                for issue in critical_issues:
                    report.append(f"- 🔴 **{issue.message}**")
                    report.append(f"  - 💡 *Suggestion:* {issue.suggestion}")
                    if issue.line_number:
                        report.append(f"  - 📍 *Line:* {issue.line_number}")
                report.append("")
        
        # Top 10 Worst Files
        worst_files = sorted(self.analysis.files, key=lambda f: f.complexity_score)[:10]
        if worst_files:
            report.append("## 📉 Files Needing Most Attention")
            report.append("")
            report.append("| File | Score | Issues | Size | Imports |")
            report.append("|------|-------|--------|------|---------|")
            for file_analysis in worst_files:
                issue_count = len(file_analysis.issues)
                size_kb = file_analysis.file_size / 1024
                report.append(f"| `{file_analysis.file_path}` | {file_analysis.complexity_score}/100 | {issue_count} | {size_kb:.1f}KB | {file_analysis.import_count} |")
            report.append("")
        
        # Detailed File Analysis
        report.append("## 📋 Detailed File Analysis")
        report.append("")
        
        # Group files by type
        frontend_files = [f for f in self.analysis.files if any(ext in f.file_path for ext in ['.tsx', '.jsx', '.ts', '.js']) and not f.file_path.endswith('.json')]
        backend_files = [f for f in self.analysis.files if f.file_path.endswith('.py')]
        config_files = [f for f in self.analysis.files if any(ext in f.file_path for ext in ['.json', '.yaml', '.yml']) or 'config' in f.file_path.lower()]
        
        if frontend_files:
            report.append("### 📱 Frontend Files")
            report.append("")
            for file_analysis in sorted(frontend_files, key=lambda f: f.complexity_score):
                self._add_file_details(report, file_analysis)
        
        if backend_files:
            report.append("### 🔧 Backend Files")
            report.append("")
            for file_analysis in sorted(backend_files, key=lambda f: f.complexity_score):
                self._add_file_details(report, file_analysis)
        
        if config_files:
            report.append("### ⚙️ Configuration Files")
            report.append("")
            for file_analysis in sorted(config_files, key=lambda f: len(f.issues), reverse=True):
                self._add_file_details(report, file_analysis)
        
        # Recommendations
        report.append("## 💡 Strategic Recommendations")
        report.append("")
        
        if self.analysis.critical_issues > 0:
            report.append("### 🚨 Immediate Actions Required:")
            report.append("1. **Fix all critical issues** - These can cause runtime errors or severe performance problems")
            report.append("2. **Implement error boundaries** - Add proper error handling throughout the application")
            report.append("3. **Review useEffect dependencies** - Fix infinite loops and missing dependencies")
            report.append("")
        
        if self.analysis.warning_issues > 5:
            report.append("### ⚡ Performance Optimizations:")
            report.append("1. **Implement dynamic imports** - For heavy components and libraries")
            report.append("2. **Add caching layers** - For API routes and expensive computations")
            report.append("3. **Optimize bundle size** - Replace heavy dependencies with lighter alternatives")
            report.append("4. **Add proper async/await** - For all HTTP calls and database operations")
            report.append("")
        
        report.append("### 🎯 Long-term Improvements:")
        report.append("1. **Code splitting** - Break large components into smaller, focused modules")
        report.append("2. **Performance monitoring** - Add metrics collection for real-time monitoring")
        report.append("3. **Automated testing** - Implement performance regression tests")
        report.append("4. **Documentation** - Document performance-critical code paths")
        report.append("")
        
        # Footer
        report.append("---")
        report.append("*Generated by Canvas LMS Codebase Auditor*")
        report.append("")
        
        return "\n".join(report)

    def _add_file_details(self, report: List[str], file_analysis: FileAnalysis):
        """Add detailed analysis for a single file to the report"""
        if not file_analysis.issues:
            return
        
        size_kb = file_analysis.file_size / 1024
        score_emoji = "🟢" if file_analysis.complexity_score >= 80 else "🟡" if file_analysis.complexity_score >= 60 else "🔴"
        
        report.append(f"#### {score_emoji} `{file_analysis.file_path}` ({file_analysis.complexity_score}/100)")
        report.append(f"*Size: {size_kb:.1f}KB | Lines: {file_analysis.line_count} | Imports: {file_analysis.import_count}*")
        report.append("")
        
        # Group issues by severity
        critical_issues = [i for i in file_analysis.issues if i.severity == 'critical']
        warning_issues = [i for i in file_analysis.issues if i.severity == 'warning']
        info_issues = [i for i in file_analysis.issues if i.severity == 'info']
        
        for issues, emoji in [(critical_issues, '🔴'), (warning_issues, '🟡'), (info_issues, '🔵')]:
            for issue in issues:
                line_info = f" (Line {issue.line_number})" if issue.line_number else ""
                report.append(f"- {emoji} **{issue.message}**{line_info}")
                report.append(f"  - 💡 *{issue.suggestion}*")
        
        report.append("")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Analyze codebase for performance issues')
    parser.add_argument('project_path', nargs='?', default='.', 
                       help='Path to the project directory (default: current directory)')
    parser.add_argument('--output', '-o', default='performance_audit.md',
                       help='Output file name (default: performance_audit.md)')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose output')
    
    args = parser.parse_args()
    
    project_path = Path(args.project_path).resolve()
    
    if not project_path.exists():
        print(f"❌ Error: Project path '{project_path}' does not exist")
        sys.exit(1)
    
    print("🚀 Canvas LMS Codebase Performance Auditor")
    print("=" * 50)
    
    # Create auditor and run analysis
    auditor = CodebaseAuditor(str(project_path))
    analysis = auditor.analyze_project()
    
    # Generate report
    report_path = auditor.generate_report(args.output)
    
    # Summary
    print("\n📊 Analysis Summary:")
    print(f"   Overall Score: {analysis.overall_score}/100")
    print(f"   Files Analyzed: {len(analysis.files)}")
    print(f"   Total Issues: {analysis.total_issues}")
    print(f"   Critical: {analysis.critical_issues} | Warning: {analysis.warning_issues} | Info: {analysis.info_issues}")
    print(f"\n📄 Full report saved to: {report_path}")
    
    if analysis.critical_issues > 0:
        print(f"\n🚨 CRITICAL: {analysis.critical_issues} critical issues found! Review immediately.")
        sys.exit(1)
    elif analysis.overall_score < 60:
        print(f"\n⚠️  WARNING: Overall score is {analysis.overall_score}/100. Performance improvements recommended.")
        sys.exit(1)
    else:
        print(f"\n✅ SUCCESS: Codebase analysis complete with score {analysis.overall_score}/100")


if __name__ == '__main__':
    main()
