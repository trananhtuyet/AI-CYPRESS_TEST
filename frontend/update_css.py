#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Read file
with open('website-analyzer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find CSS boundaries
css_start = content.find('<style>') + 7  # Start after <style>
css_end = content.find('</style>')

# Keep everything before and after CSS
before = content[:css_start]
after = content[css_end:]

# New CSS
new_css = '''
        :root {
            --primary: #52b788;
            --primary-dark: #1b4332;
            --primary-soft: #b7e4c7;
            --bg-body: #f7fffb;
            --text-main: #2d6a4f;
            --text-muted: #6b9080;
            --text-primary: #1b4332;
            --glass-white: rgba(255, 255, 255, 0.8);
            --border-soft: rgba(82, 183, 136, 0.15);
            --success: #40916c;
            --danger: #d62828;
            --sidebar-width: 280px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        body {
            background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            overflow-x: hidden;
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
            width: var(--sidebar-width);
            height: 100vh;
            background: white;
            border-right: 1px solid var(--border-soft);
            position: fixed;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(27, 67, 50, 0.08);
            z-index: 1000;
        }

        .sidebar-brand {
            padding: 2rem 1.5rem;
            font-size: 1.4rem;
            font-weight: 800;
            color: var(--primary-dark);
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid var(--border-soft);
        }

        .sidebar-brand i {
            font-size: 1.6rem;
            color: var(--primary);
        }

        .sidebar-menu {
            flex: 1;
            padding: 1.5rem 0.8rem;
            overflow-y: auto;
        }

        .menu-item {
            display: flex;
            align-items: center;
            padding: 1rem 1.2rem;
            color: var(--text-muted);
            text-decoration: none;
            border-radius: 12px;
            margin-bottom: 0.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
            font-size: 0.95rem;
        }

        .menu-item i {
            margin-right: 12px;
            width: 20px;
            text-align: center;
            font-size: 1.1rem;
        }

        .menu-item:hover {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.1), rgba(82, 183, 136, 0.05));
            color: var(--primary);
            transform: translateX(5px);
        }

        .menu-item.active {
            background: linear-gradient(135deg, var(--primary), var(--success));
            color: white;
            box-shadow: 0 4px 12px rgba(82, 183, 136, 0.3);
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
            max-width: calc(100vw - var(--sidebar-width));
            overflow-x: hidden;
        }

        .page-header {
            margin-bottom: 3rem;
        }

        .page-title {
            font-size: 2.5rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary), #2d7a5e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
            color: var(--text-muted);
            font-size: 1rem;
            margin: 0;
        }

        /* ===== SEARCH CARD ===== */
        .search-card {
            display: flex;
            gap: 1rem;
            margin-bottom: 3rem;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .search-input {
            flex: 1;
            padding: 1rem 1.5rem;
            border: 2px solid transparent;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.7);
            font-size: 1rem;
            font-family: inherit;
            transition: all 0.3s ease;
        }

        .search-input:focus {
            outline: none;
            background: white;
            border-color: var(--primary);
            box-shadow: 0 4px 16px rgba(82, 183, 136, 0.15);
        }

        .search-btn {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, var(--primary), #2d7a5e);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(82, 183, 136, 0.3);
            white-space: nowrap;
        }

        .search-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(82, 183, 136, 0.4);
        }

        /* ===== LOADING STATE ===== */
        .loading-container {
            text-align: center;
            padding: 4rem 2rem;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
            backdrop-filter: blur(10px);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .loading-container p {
            margin-top: 1.5rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(82, 183, 136, 0.2);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* ===== INFO CARD ===== */
        .info-card {
            background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.95) 100%);
            border: 1px solid rgba(82, 183, 136, 0.2);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
            backdrop-filter: blur(10px);
        }

        .info-card-header h2 {
            font-size: 1.8rem;
            font-weight: 900;
            color: var(--primary-dark);
            margin: 0 0 0.5rem 0;
        }

        .website-url {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin: 0;
            word-break: break-all;
        }

        .info-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(82, 183, 136, 0.1);
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary), #2d7a5e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .stat-label {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.5rem;
            font-weight: 600;
        }

        /* ===== CONTENT GRID ===== */
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .content-column {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        /* ===== SECTION BLOCK ===== */
        .section-block {
            background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.98) 100%);
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
        }

        .section-block:hover {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border-color: rgba(82, 183, 136, 0.15);
        }

        .section-block.sticky-top {
            position: sticky;
            top: 2rem;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid rgba(82, 183, 136, 0.1);
        }

        .section-title i {
            font-size: 1.3rem;
            color: var(--primary);
        }

        .section-title h3 {
            font-size: 1.2rem;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
        }

        /* ===== FEATURES GRID ===== */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .feature-item {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.08), rgba(82, 183, 136, 0.03));
            border: 1px solid rgba(82, 183, 136, 0.2);
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .feature-item:hover {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.15), rgba(82, 183, 136, 0.08));
            border-color: var(--primary);
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(82, 183, 136, 0.15);
        }

        .feature-item-icon {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
        }

        .feature-item-name {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        /* ===== TEST CASES GRID ===== */
        .test-cases-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .test-case-item {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02));
            border: 1px solid rgba(59, 130, 246, 0.15);
            border-radius: 12px;
            padding: 1.25rem;
            transition: all 0.3s ease;
        }

        .test-case-item:hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
            border-color: #3b82f6;
            transform: translateX(4px);
        }

        .test-case-title {
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            margin-bottom: 0.5rem;
        }

        .test-case-description {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin: 0;
        }

        /* ===== ACTION BUTTONS ===== */
        .action-buttons {
            display: grid;
            gap: 0.75rem;
        }

        .btn-action {
            padding: 1rem;
            border: none;
            border-radius: 12px;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }

        .btn-action.primary {
            background: linear-gradient(135deg, var(--primary), #2d7a5e);
            color: white;
            box-shadow: 0 4px 16px rgba(82, 183, 136, 0.3);
        }

        .btn-action.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(82, 183, 136, 0.4);
        }

        .btn-action.secondary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .btn-action.secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .btn-action.tertiary {
            background: linear-gradient(135deg, #8b5cf6, #6d28d9);
            color: white;
            box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
        }

        .btn-action.tertiary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
        }

        /* ===== RESULTS ===== */
        .results-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .result-box {
            padding: 1.25rem;
            border-radius: 12px;
            text-align: center;
        }

        .result-box.success {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
            border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .result-box.danger {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .result-number {
            font-size: 2rem;
            font-weight: 900;
        }

        .result-box.success .result-number {
            color: #22c55e;
        }

        .result-box.danger .result-number {
            color: #ef4444;
        }

        .result-label {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.5rem;
            font-weight: 600;
        }

        .result-rate {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.1), rgba(82, 183, 136, 0.05));
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid rgba(82, 183, 136, 0.2);
            margin-bottom: 1.5rem;
        }

        .rate-number {
            font-size: 2.5rem;
            font-weight: 900;
            color: var(--primary);
        }

        .rate-label {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.5rem;
            font-weight: 600;
        }

        .results-list {
            display: grid;
            gap: 0.75rem;
        }

        .result-item {
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            padding: 0.75rem;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* ===== EXPORT BUTTONS ===== */
        .export-buttons {
            display: grid;
            gap: 0.75rem;
        }

        .btn-export {
            padding: 0.75rem;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 10px;
            color: #3b82f6;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-export:hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08));
            border-color: #3b82f6;
            transform: translateY(-2px);
        }

        /* ===== CUSTOM TESTS TABS ===== */
        .custom-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid rgba(82, 183, 136, 0.1);
        }

        .tab-button {
            padding: 0.75rem 1rem;
            background: none;
            border: none;
            color: var(--text-muted);
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .tab-button.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
        }

        .tab-button:hover:not(.active) {
            color: var(--text-primary);
        }

        .tab-pane {
            display: none;
        }

        .tab-pane.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ===== FORM ELEMENTS ===== */
        .custom-form {
            display: grid;
            gap: 1.5rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1rem;
        }

        .form-group {
            display: grid;
            gap: 0.5rem;
        }

        .form-group label {
            font-weight: 700;
            color: var(--text-primary);
            font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 0.75rem 1rem;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            font-size: 0.95rem;
            font-family: inherit;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.95));
            box-shadow: 0 4px 12px rgba(82, 183, 136, 0.15);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .btn-submit {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--primary), #2d7a5e);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(82, 183, 136, 0.3);
        }

        /* ===== FULL WIDTH ===== */
        .full-width {
            grid-column: 1 / -1;
        }

        /* ===== UTILITY CLASSES ===== */
        .hidden {
            display: none !important;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
            .content-grid {
                grid-template-columns: 1fr;
            }

            .info-stats {
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .section-block.sticky-top {
                position: static;
            }
        }

        @media (max-width: 768px) {
            .main-content {
                padding: 1rem;
                margin-left: 0;
            }

            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
                border-right: none;
                border-bottom: 1px solid var(--border-soft);
                flex-direction: row;
                align-items: center;
                padding: 1rem;
                margin-bottom: 1rem;
            }

            .sidebar-brand {
                padding: 0;
                border: none;
                margin-bottom: 0;
                margin-right: auto;
            }

            .sidebar-menu {
                display: none;
            }

            .page-title {
                font-size: 2rem;
            }

            .page-subtitle {
                font-size: 0.9rem;
            }

            .search-card {
                flex-direction: column;
            }

            .search-input,
            .search-btn {
                width: 100%;
            }

            .info-stats {
                gap: 0.75rem;
            }

            .stat-number {
                font-size: 1.8rem;
            }

            .features-grid {
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            }
        }

        @media (max-width: 480px) {
            .main-content {
                padding: 0.75rem;
            }

            .page-title {
                font-size: 1.5rem;
            }

            .search-card {
                padding: 1rem;
                gap: 0.5rem;
            }

            .section-block {
                padding: 1rem;
            }

            .info-card {
                padding: 1rem;
            }

            .info-stats {
                grid-template-columns: 1fr;
            }
        }
    '''

# Combine and write
new_content = before + new_css + after
with open('website-analyzer.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ CSS updated successfully!")
print(f"New file size: {len(new_content)} bytes")
