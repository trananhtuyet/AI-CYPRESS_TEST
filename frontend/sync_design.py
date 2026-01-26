#!/usr/bin/env python3
# -*- coding: utf-8 -*-

new_html = '''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Analyzer - AI Testing Platform</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #52b788;
            --primary-dark: #1b4332;
            --primary-soft: #b7e4c7;
            --bg-body: #f7fffb;
            --text-main: #2d6a4f;
            --text-muted: #6b9080;
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
            overflow-y: auto;
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
            box-shadow: 0 8px 20px rgba(82, 183, 136, 0.3);
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
            max-width: calc(100vw - var(--sidebar-width));
            overflow-x: hidden;
        }

        /* ===== HEADER ===== */
        .page-header {
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary-dark);
        }

        .page-subtitle {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-top: 0.25rem;
        }

        /* ===== SEARCH CARD ===== */
        .search-card {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            background: var(--glass-white);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 10px 30px rgba(45, 106, 79, 0.05);
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
            background: linear-gradient(135deg, var(--primary), var(--success));
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(82, 183, 136, 0.3);
            white-space: nowrap;
            font-weight: 700;
        }

        .search-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(82, 183, 136, 0.4);
        }

        /* ===== LOADING STATE ===== */
        .loading-container {
            text-align: center;
            padding: 4rem 2rem;
            background: var(--glass-white);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 10px 30px rgba(45, 106, 79, 0.05);
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(82, 183, 136, 0.2);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1.5rem;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .loading-container p {
            color: var(--text-muted);
            font-weight: 500;
        }

        .hidden { display: none !important; }

        /* ===== CARD GLASS ===== */
        .card-glass {
            background: var(--glass-white);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(45, 106, 79, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-glass:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(82, 183, 136, 0.15);
            border-color: rgba(82, 183, 136, 0.3);
        }

        /* ===== INFO CARD ===== */
        .info-card {
            background: linear-gradient(135deg, var(--primary), var(--success));
            color: white;
            padding: 2rem;
            border-radius: 20px;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(82, 183, 136, 0.3);
        }

        .info-card h2 {
            font-size: 2rem;
            font-weight: 900;
            margin: 0 0 0.5rem 0;
        }

        .info-url {
            font-size: 0.95rem;
            opacity: 0.95;
            word-break: break-all;
        }

        .info-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
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
            background: var(--glass-white);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(45, 106, 79, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section-block:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(82, 183, 136, 0.15);
            border-color: rgba(82, 183, 136, 0.3);
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
            border-bottom: 2px solid var(--border-soft);
            font-size: 1.2rem;
            font-weight: 800;
            color: var(--primary-dark);
        }

        .section-title i {
            font-size: 1.3rem;
            color: var(--primary);
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
            border-radius: 16px;
            padding: 1rem;
            text-align: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }

        .feature-item:hover {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.15), rgba(82, 183, 136, 0.08));
            border-color: var(--primary);
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(82, 183, 136, 0.15);
        }

        .feature-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--primary);
        }

        .feature-name {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--primary-dark);
        }

        /* ===== TEST CASES GRID ===== */
        .test-cases-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .test-case-item {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.05), rgba(82, 183, 136, 0.02));
            border: 1px solid rgba(82, 183, 136, 0.15);
            border-radius: 16px;
            padding: 1.25rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .test-case-item:hover {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.1), rgba(82, 183, 136, 0.05));
            border-color: var(--primary);
            transform: translateX(4px);
            box-shadow: 0 8px 16px rgba(82, 183, 136, 0.15);
        }

        .test-case-title {
            font-weight: 700;
            color: var(--primary-dark);
            margin: 0;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }

        .test-case-desc {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin: 0;
            margin-bottom: 1rem;
            line-height: 1.4;
        }

        .test-case-code {
            background: #1a1a1a;
            color: #e5e5e5;
            padding: 1rem;
            border-radius: 12px;
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 200px;
            overflow-y: auto;
            line-height: 1.4;
        }

        /* ===== ACTION BUTTONS ===== */
        .action-buttons {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
        }

        .btn-action {
            padding: 1rem;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-decoration: none;
        }

        .btn-action.primary {
            background: linear-gradient(135deg, var(--primary), var(--success));
            color: white;
            box-shadow: 0 4px 16px rgba(82, 183, 136, 0.3);
        }

        .btn-action.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(82, 183, 136, 0.4);
        }

        .btn-action.secondary {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.1), rgba(82, 183, 136, 0.05));
            color: var(--primary);
            border: 2px solid var(--primary);
        }

        .btn-action.secondary:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.15), rgba(82, 183, 136, 0.08));
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
            border-radius: 16px;
            text-align: center;
        }

        .result-box.success {
            background: linear-gradient(135deg, rgba(64, 145, 108, 0.1), rgba(64, 145, 108, 0.05));
            border: 1px solid rgba(64, 145, 108, 0.2);
        }

        .result-box.danger {
            background: linear-gradient(135deg, rgba(214, 40, 40, 0.1), rgba(214, 40, 40, 0.05));
            border: 1px solid rgba(214, 40, 40, 0.2);
        }

        .result-number {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.25rem;
        }

        .result-box.success .result-number { color: var(--success); }
        .result-box.danger .result-number { color: var(--danger); }

        .result-label {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.5rem;
            font-weight: 600;
        }

        .result-rate {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.1), rgba(82, 183, 136, 0.05));
            border: 1px solid rgba(82, 183, 136, 0.2);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
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
            gap: 1rem;
        }

        /* ===== EXPORT BUTTONS ===== */
        .export-buttons {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
        }

        .btn-export {
            padding: 0.75rem;
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.1), rgba(82, 183, 136, 0.05));
            border: 2px solid rgba(82, 183, 136, 0.3);
            border-radius: 12px;
            color: var(--primary);
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-export:hover {
            background: linear-gradient(135deg, rgba(82, 183, 136, 0.15), rgba(82, 183, 136, 0.08));
            border-color: var(--primary);
            transform: translateY(-2px);
        }

        /* ===== TABS ===== */
        .custom-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid var(--border-soft);
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
            font-size: 0.95rem;
        }

        .tab-button.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
        }

        .tab-button:hover:not(.active) {
            color: var(--primary-dark);
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
            color: var(--primary-dark);
            font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 0.75rem 1rem;
            border: 1px solid rgba(82, 183, 136, 0.2);
            border-radius: 12px;
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
            background: linear-gradient(135deg, var(--primary), var(--success));
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
                font-size: 1.5rem;
            }

            .search-card {
                flex-direction: column;
            }

            .info-stats {
                gap: 0.75rem;
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
                font-size: 1.25rem;
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
                gap: 0.75rem;
            }

            .stat-number {
                font-size: 1.8rem;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- SIDEBAR -->
    <aside class="sidebar">
        <div class="sidebar-brand">
            <i class="fas fa-globe"></i> Analyzer
        </div>
        <nav class="sidebar-menu">
            <a href="dashboard.html" class="menu-item">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="analytics.html" class="menu-item">
                <i class="fas fa-chart-bar"></i> Analytics
            </a>
            <a href="website-analyzer.html" class="menu-item active">
                <i class="fas fa-globe"></i> Website Analyzer
            </a>
            <a href="script-review.html" class="menu-item">
                <i class="fas fa-code"></i> Script Review
            </a>
            <a href="auth.html" class="menu-item" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
        <!-- PAGE HEADER -->
        <div class="page-header">
            <h1 class="page-title">Website Analyzer</h1>
            <p class="page-subtitle">Phân tích website & sinh test case tự động với Cypress</p>
        </div>

        <!-- SEARCH CARD -->
        <div class="search-card">
            <input type="url" id="websiteUrl" class="search-input" placeholder="Nhập URL website để phân tích..." />
            <button onclick="analyzeWebsite()" class="search-btn">
                <i class="fas fa-search"></i> Phân tích
            </button>
        </div>

        <!-- LOADING STATE -->
        <div id="loadingState" class="loading-container hidden">
            <div class="spinner"></div>
            <p>Đang phân tích website...</p>
        </div>

        <!-- ANALYSIS CONTENT -->
        <div id="analysisContent" class="hidden">
            <!-- INFO CARD -->
            <div class="info-card">
                <h2 id="analyzedTitle">Website Title</h2>
                <p id="analyzedUrl" style="margin: 0;">https://example.com</p>
                <div class="info-stats">
                    <div class="stat-item">
                        <div class="stat-number" id="featuresCount">0</div>
                        <div class="stat-label">Chức Năng</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number" id="testCasesCount">0</div>
                        <div class="stat-label">AI Tests</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number" id="customTestCount">0</div>
                        <div class="stat-label">Custom</div>
                    </div>
                </div>
            </div>

            <!-- CONTENT GRID -->
            <div class="content-grid">
                <!-- LEFT COLUMN -->
                <div class="content-column">
                    <!-- FEATURES -->
                    <div class="section-block">
                        <div class="section-title">
                            <i class="fas fa-cube"></i>
                            Chức Năng Phát Hiện
                        </div>
                        <div id="featuresContainer" class="features-grid"></div>
                    </div>

                    <!-- TEST CASES -->
                    <div class="section-block">
                        <div class="section-title">
                            <i class="fas fa-robot"></i>
                            Test Cases (AI)
                        </div>
                        <div id="testCasesContainer" class="test-cases-grid"></div>
                    </div>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="content-column">
                    <!-- ACTIONS -->
                    <div class="section-block sticky-top">
                        <div class="section-title">
                            <i class="fas fa-play-circle"></i>
                            Chạy Tests
                        </div>
                        <div class="action-buttons">
                            <button onclick="runAllTests()" class="btn-action primary">
                                <i class="fas fa-play"></i> Chạy Tất Cả
                            </button>
                            <button onclick="runAITests()" class="btn-action secondary">
                                <i class="fas fa-robot"></i> Chạy AI Tests
                            </button>
                            <button onclick="runCustomTests()" class="btn-action secondary">
                                <i class="fas fa-check-square"></i> Chạy Custom
                            </button>
                        </div>
                    </div>

                    <!-- RESULTS -->
                    <div id="testResultsSection" class="section-block hidden">
                        <div class="section-title">
                            <i class="fas fa-chart-bar"></i>
                            Kết Quả
                        </div>
                        <div class="results-summary">
                            <div class="result-box success">
                                <div class="result-number" id="passedTests">0</div>
                                <div class="result-label">Passed</div>
                            </div>
                            <div class="result-box danger">
                                <div class="result-number" id="failedTests">0</div>
                                <div class="result-label">Failed</div>
                            </div>
                        </div>
                        <div class="result-rate">
                            <div class="rate-number" id="passRate">0%</div>
                            <div class="rate-label">Success Rate</div>
                        </div>
                        <div id="testResultsList" class="results-list"></div>
                    </div>

                    <!-- EXPORT -->
                    <div class="section-block">
                        <div class="section-title">
                            <i class="fas fa-download"></i>
                            Xuất Kết Quả
                        </div>
                        <div class="export-buttons">
                            <button onclick="exportCypressTests()" class="btn-export">
                                <i class="fas fa-file-code"></i> Cypress
                            </button>
                            <button onclick="exportAsJSON()" class="btn-export">
                                <i class="fas fa-file-code"></i> JSON
                            </button>
                            <button onclick="exportAsCSV()" class="btn-export">
                                <i class="fas fa-file-csv"></i> CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CUSTOM TESTS -->
            <div class="section-block full-width">
                <div class="section-title">
                    <i class="fas fa-plus-circle"></i>
                    Test Cases Tùy Chỉnh
                </div>

                <div class="custom-tabs">
                    <button class="tab-button active" onclick="showTab('add-custom')">
                        <i class="fas fa-file-plus"></i> Thêm Mới
                    </button>
                    <button class="tab-button" onclick="showTab('list-custom')">
                        <i class="fas fa-list-check"></i> Danh Sách
                    </button>
                </div>

                <!-- ADD FORM -->
                <div id="add-custom" class="tab-pane active">
                    <form class="custom-form" onsubmit="addCustomTestCase(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Tên Test</label>
                                <input type="text" id="testCaseName" placeholder="VD: Login validation" required />
                            </div>
                            <div class="form-group">
                                <label>Loại Test</label>
                                <select id="testCaseType" required>
                                    <option>Functional</option>
                                    <option>Security</option>
                                    <option>Performance</option>
                                    <option>UI/UX</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Ưu Tiên</label>
                                <select id="testCasePriority" required>
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Mô Tả Các Bước</label>
                            <textarea id="testCaseSteps" placeholder="1. Mở trang...&#10;2. Nhập..." required></textarea>
                        </div>

                        <div class="form-group">
                            <label>Cypress Code</label>
                            <textarea id="testCaseCode" placeholder="cy.visit('/')&#10;cy.get('input').type('test')" required></textarea>
                        </div>

                        <button type="submit" class="btn-submit">
                            <i class="fas fa-save"></i> Lưu Test Case
                        </button>
                    </form>
                </div>

                <!-- LIST -->
                <div id="list-custom" class="tab-pane">
                    <div id="customTestCasesContainer" class="test-cases-grid"></div>
                </div>
            </div>
        </div>
    </main>

    <script>
        let analyzedData = null;
        let customTestCases = [];

        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'auth.html';
        }

        function showTab(tabId) {
            document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }

        async function analyzeWebsite() {
            const url = document.getElementById('websiteUrl').value.trim();
            if (!url) {
                alert('Vui lòng nhập URL');
                return;
            }

            try {
                new URL(url);
            } catch {
                alert('URL không hợp lệ');
                return;
            }

            showLoading(true);

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = 'auth.html';
                    return;
                }

                const response = await fetch('http://localhost:3000/api/website-analyzer', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });

                if (!response.ok) throw new Error('Phân tích thất bại');

                const data = await response.json();
                analyzedData = data;
                displayAnalysis(data);
            } catch (error) {
                alert('Lỗi: ' + error.message);
            } finally {
                showLoading(false);
            }
        }

        function showLoading(show) {
            document.getElementById('loadingState').classList.toggle('hidden', !show);
            document.getElementById('analysisContent').classList.toggle('hidden', show);
        }

        function displayAnalysis(data) {
            document.getElementById('analyzedTitle').textContent = data.title || 'Website';
            document.getElementById('analyzedUrl').textContent = data.url || '';
            document.getElementById('featuresCount').textContent = (data.features || []).length;
            document.getElementById('testCasesCount').textContent = (data.testCases || []).length;
            document.getElementById('customTestCount').textContent = customTestCases.length;

            const featuresContainer = document.getElementById('featuresContainer');
            featuresContainer.innerHTML = (data.features || []).map(feature => `
                <div class="feature-item">
                    <div class="feature-icon"><i class="fas ${getFeatureIcon(feature.type)}"></i></div>
                    <div class="feature-name">${feature.name}</div>
                </div>
            `).join('');

            const testCasesContainer = document.getElementById('testCasesContainer');
            testCasesContainer.innerHTML = (data.testCases || []).map(testCase => `
                <div class="test-case-item">
                    <div class="test-case-title">${testCase.title}</div>
                    <div class="test-case-desc">${testCase.description}</div>
                    <div class="test-case-code">${escapeHtml(testCase.code)}</div>
                </div>
            `).join('');

            displayCustomTestCases();
            setTimeout(() => document.querySelector('.info-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        }

        function getFeatureIcon(type) {
            const icons = {
                'form': 'fa-clipboard-list',
                'navigation': 'fa-directions',
                'authentication': 'fa-lock',
                'search': 'fa-search',
                'modal': 'fa-window-maximize',
                'table': 'fa-table',
                'api': 'fa-network-wired',
                'payment': 'fa-credit-card',
                'social': 'fa-share-alt'
            };
            return icons[type] || 'fa-cube';
        }

        function addCustomTestCase(event) {
            event.preventDefault();

            customTestCases.push({
                id: Date.now(),
                name: document.getElementById('testCaseName').value,
                type: document.getElementById('testCaseType').value,
                priority: document.getElementById('testCasePriority').value,
                steps: document.getElementById('testCaseSteps').value,
                code: document.getElementById('testCaseCode').value
            });

            event.target.reset();
            displayCustomTestCases();
            document.getElementById('customTestCount').textContent = customTestCases.length;
            alert('✅ Test case đã được lưu!');
        }

        function displayCustomTestCases() {
            const container = document.getElementById('customTestCasesContainer');
            if (!customTestCases.length) {
                container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Chưa có test case tùy chỉnh</p>';
                return;
            }

            container.innerHTML = customTestCases.map(tc => `
                <div class="test-case-item">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <div>
                            <div class="test-case-title">${tc.name}</div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.3rem;">
                                <span style="font-size: 0.75rem; padding: 0.3rem 0.75rem; background: rgba(82, 183, 136, 0.1); color: var(--primary); border-radius: 6px; font-weight: 700;">${tc.type}</span>
                                <span style="font-size: 0.75rem; padding: 0.3rem 0.75rem; background: rgba(82, 183, 136, 0.1); color: var(--primary); border-radius: 6px; font-weight: 700;">${tc.priority}</span>
                            </div>
                        </div>
                        <button onclick="deleteCustomTestCase(${tc.id})" style="background: rgba(214, 40, 40, 0.1); color: var(--danger); border: none; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 700;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="test-case-desc" style="white-space: pre-wrap; margin-bottom: 0.75rem;">${escapeHtml(tc.steps)}</div>
                    <div class="test-case-code">${escapeHtml(tc.code)}</div>
                </div>
            `).join('');
        }

        function deleteCustomTestCase(id) {
            customTestCases = customTestCases.filter(tc => tc.id !== id);
            displayCustomTestCases();
            document.getElementById('customTestCount').textContent = customTestCases.length;
        }

        async function runAllTests() {
            const codes = [...(analyzedData?.testCases || []).map(tc => tc.code), ...customTestCases.map(tc => tc.code)];
            await executeTests(codes);
        }

        async function runAITests() {
            const codes = (analyzedData?.testCases || []).map(tc => tc.code);
            await executeTests(codes);
        }

        async function runCustomTests() {
            if (!customTestCases.length) {
                alert('⚠️ Không có custom test case');
                return;
            }
            const codes = customTestCases.map(tc => tc.code);
            await executeTests(codes);
        }

        async function executeTests(codes) {
            if (!codes.length) {
                alert('⚠️ Không có test case');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = 'auth.html';
                    return;
                }

                const resultsSection = document.getElementById('testResultsSection');
                resultsSection.classList.remove('hidden');
                resultsSection.scrollIntoView({ behavior: 'smooth' });

                const response = await fetch('http://localhost:3000/api/run-cypress-tests', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ testCodes: codes, url: document.getElementById('websiteUrl').value })
                });

                if (!response.ok) throw new Error('Chạy tests thất bại');
                const results = await response.json();
                displayTestResults(results);
            } catch (error) {
                alert('Lỗi: ' + error.message);
            }
        }

        function displayTestResults(results) {
            const total = results.results.length;
            const passed = results.results.filter(r => r.status === 'pass').length;
            const failed = total - passed;
            const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

            document.getElementById('passedTests').textContent = passed;
            document.getElementById('failedTests').textContent = failed;
            document.getElementById('passRate').textContent = passRate + '%';

            const resultsList = document.getElementById('testResultsList');
            resultsList.innerHTML = results.results.map((r, i) => {
                const isPass = r.status === 'pass';
                const borderColor = isPass ? 'rgba(64, 145, 108, 0.5)' : 'rgba(214, 40, 40, 0.5)';
                return `
                    <div class="card-glass" style="border-left: 4px solid ${borderColor};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <strong>Test ${i + 1}</strong>
                            <span style="font-size: 0.75rem; padding: 0.3rem 0.75rem; background: ${isPass ? 'rgba(64, 145, 108, 0.1)' : 'rgba(214, 40, 40, 0.1)'}; color: ${isPass ? 'var(--success)' : 'var(--danger)'}; border-radius: 6px; font-weight: 700;">${r.status.toUpperCase()}</span>
                        </div>
                        ${r.output ? `<div class="test-case-code">${escapeHtml(r.output)}</div>` : ''}
                    </div>
                `;
            }).join('');

            alert(`✅ Kết quả: ${passed}/${total} tests passed (${passRate}%)`);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function exportCypressTests() {
            const codes = [...(analyzedData?.testCases || []).map(t => t.code), ...customTestCases.map(t => t.code)];
            const content = codes.join('\\n\\n// ===== NEXT TEST =====\\n\\n');
            downloadFile(content, 'cypress-tests.js', 'text/javascript');
        }

        function exportAsJSON() {
            const data = {
                website: document.getElementById('websiteUrl').value,
                timestamp: new Date().toISOString(),
                features: analyzedData?.features || [],
                aiTests: analyzedData?.testCases || [],
                customTests: customTestCases
            };
            downloadFile(JSON.stringify(data, null, 2), 'analysis.json', 'application/json');
        }

        function exportAsCSV() {
            let csv = 'Name,Type,Priority,Steps,Code\\n';
            customTestCases.forEach(t => csv += `"${t.name}","${t.type}","${t.priority}","${t.steps.replace(/"/g, '""')}","${t.code.replace(/"/g, '""')}"\\n`);
            downloadFile(csv, 'analysis.csv', 'text/csv');
        }

        function downloadFile(content, filename, type) {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }
    </script>
</body>
</html>
'''

with open('website-analyzer.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('✅ Giao diện đã được đồng nhất!')
