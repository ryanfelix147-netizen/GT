import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

# --- CONFIGURAÇÃO DA PÁGINA ---
st.set_page_config(
    page_title="TrackingGT - Dashboard Guatemala",
    page_icon="🇬🇹",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- ESTILIZAÇÃO CUSTOMIZADA (CSS) ---
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    
    * { font-family: 'Inter', sans-serif; }
    
    .stApp { background-color: #F8FAFC; }
    
    /* Customização de KPIs */
    div[data-testid="stMetricValue"] {
        font-weight: 900;
        letter-spacing: -0.05em;
        color: #0F172A;
    }
    
    /* Login Screen Container */
    .auth-box {
        max-width: 450px;
        margin: 50px auto;
        padding: 40px;
        background: white;
        border-radius: 30px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        border: 1px solid #F1F5F9;
    }
    </style>
""", unsafe_allow_browser=True)

# --- SISTEMA DE AUTENTICAÇÃO ---
if 'authenticated' not in st.session_state:
    st.session_state['authenticated'] = False

def login_screen():
    st.markdown("<h1 style='text-align: center; color: #1E293B; font-weight: 900; font-style: italic;'>TrackingGT</h1>", unsafe_allow_browser=True)
    st.markdown("<p style='text-align: center; color: #64748B; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em;'>Guatemala Operational Intelligence</p>", unsafe_allow_browser=True)
    
    with st.container():
        st.markdown('<div class="auth-box">', unsafe_allow_browser=True)
        st.subheader("🔐 Acesso ao Dashboard")
        
        email = st.text_input("E-mail corporativo")
        password = st.text_input("Sua senha secreta", type="password")
        
        col1, col2 = st.columns(2)
        if col1.button("Entrar no Painel", use_container_width=True, type="primary"):
            if email and password:
                st.session_state['authenticated'] = True
                st.rerun()
            else:
                st.error("Preencha os campos para acessar.")
        
        if col2.button("Criar Acesso", use_container_width=True):
            st.info("Funcionalidade de cadastro simulada.")
        st.markdown('</div>', unsafe_allow_browser=True)

# --- LOGICA PRINCIPAL DO DASHBOARD ---
if not st.session_state['authenticated']:
    login_screen()
else:
    # --- DADOS INICIAIS (SIMULADOS) ---
    GTQ_TO_BRL = 0.64
    dates = [(datetime.now() - timedelta(days=i)).strftime("%d/%m") for i in range(7)][::-1]
    df = pd.DataFrame({
        'Data': dates,
        'Receita_BRL': [7500, 8200, 9100, 7800, 10200, 11500, 12800],
        'Lucro_BRL': [1200, 1500, 1800, 1100, 2200, 2800, 3100],
        'Gasto_Ads_BRL': [2100, 2300, 2500, 2400, 2800, 3100, 3400],
        'Pedidos': [32, 38, 41, 35, 48, 52, 58]
    })

    # --- SIDEBAR ---
    st.sidebar.markdown("<h2 style='font-weight: 900; font-style: italic; color: #2563EB;'>TrackingGT</h2>", unsafe_allow_browser=True)
    page = st.sidebar.radio("Navegação", ["📊 Overview Geral", "📦 Performance Produtos", "🎯 Marketing & Ads", "🚚 Logística Droplatam"])
    
    st.sidebar.divider()
    if st.sidebar.button("Sair do Sistema", use_container_width=True):
        st.session_state['authenticated'] = False
        st.rerun()

    # --- PÁGINAS ---
    if page == "📊 Overview Geral":
        st.title("Performance Operacional")
        
        # KPIs principais
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Receita Total", f"R$ {df['Receita_BRL'].sum():,.2f}", "+14%")
        k2.metric("Lucro Líquido", f"R$ {df['Lucro_BRL'].sum():,.2f}", "+9%")
        k3.metric("Gasto Ads", f"R$ {df['Gasto_Ads_BRL'].sum():,.2f}", "-5%")
        k4.metric("ROI Médio", "3.2x", "+0.2")

        # Gráfico de Área
        st.subheader("Evolução Financeira (BRL)")
        fig = px.area(df, x='Data', y=['Receita_BRL', 'Lucro_BRL'], 
                      color_discrete_map={"Receita_BRL": "#2563EB", "Lucro_BRL": "#10B981"},
                      labels={"value": "Reais (R$)", "variable": "Métrica"})
        fig.update_layout(hovermode="x unified", legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1))
        st.plotly_chart(fig, use_container_width=True)

    elif page == "📦 Performance Produtos":
        st.title("Análise por SKU")
        products_df = pd.DataFrame({
            "Produto": ["BOLSO TRIBAL – NUEVA EDICION", "CONJUNTO ADIDAS REF: 2266", "CAMISETA COL + GORRA"],
            "Pedidos": [12, 1, 45],
            "Efetividade": ["25%", "0%", "68%"],
            "Faturamento (BRL)": [205.42, 0.00, 4250.00]
        })
        st.dataframe(products_df, use_container_width=True, hide_index=True)
        st.info("Dica: Produtos com efetividade abaixo de 30% na Guatemala precisam de revisão no criativo.")

    elif page == "🎯 Marketing & Ads":
        st.title("Métricas de Tráfego")
        c_a, c_b = st.columns(2)
        
        with c_a:
            st.subheader("Budget por Canal")
            pie = px.pie(values=[70, 20, 10], names=['Facebook Ads', 'Google Ads', 'TikTok Ads'], 
                         color_discrete_sequence=["#1877F2", "#EA4335", "#000000"])
            st.plotly_chart(pie, use_container_width=True)
            
        with c_b:
            st.subheader("Custo por Aquisição (CAC)")
            st.bar_chart(df.set_index('Data')['Gasto_Ads_BRL'])

    elif page == "🚚 Logística Droplatam":
        st.title("Sincronização Cloud")
        st.success("API Droplatam conectada com o centro de distribuição na Cidade da Guatemala.")
        st.write("Pedidos recentes prontos para despacho:")
        st.table(df[['Data', 'Pedidos', 'Receita_BRL']])
