import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import interp1d
import glob
import os

# ================= 配置区域 =================
# 图表风格设置 (模仿 MoTeC)
plt.style.use('seaborn-v0_8-white')
MOTEC_COLORS = {'bg': 'white', 'grid': '#d3d3d3', 'text': 'black'}
LINE_COLORS = ['#e74c3c', '#3498db'] # 红, 蓝

def setup_plot_style(ax):
    """设置单个子图的MoTeC风格"""
    ax.grid(True, which='major', color=MOTEC_COLORS['grid'], linestyle='--', linewidth=0.5)
    ax.set_facecolor(MOTEC_COLORS['bg'])
    ax.tick_params(axis='both', which='major', labelsize=8)

# ================= 核心逻辑 =================

def process_single_log(filepath):
    """单文件分析模式：速度 + 纵向G值 (模拟)"""
    print(f"检测到单个文件，正在进行单圈深度分析: {filepath}")
    
    df = pd.read_csv(filepath)
    filename = os.path.basename(filepath)
    
    # --- 数据计算 ---
    # 1. 计算加速度 (Longitudinal G)
    # G = (delta_v / delta_t) / 9.81
    # 先把 km/h 转为 m/s
    v_ms = df['Speed(km/h)'] / 3.6
    
    # 计算梯度 (加速度)
    # 使用 gradient 函数计算变化率
    acc_ms2 = np.gradient(v_ms, df['Time(s)'])
    
    # 转换为 G 值 (并简单的平滑处理一下噪音)
    df['LongG'] = pd.Series(acc_ms2 / 9.81).rolling(window=5, center=True).mean()

    # --- 绘图 ---
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True, 
                                   gridspec_kw={'height_ratios': [2, 1]})
    
    # 图1: 速度
    ax1.plot(df['Distance(m)'], df['Speed(km/h)'], color='black', linewidth=1.5, label=filename)
    ax1.set_ylabel('Speed [km/h]', fontsize=10, fontweight='bold')
    ax1.legend(loc='upper right', fontsize=8)
    ax1.set_title(f"Single Lap Analysis: {filename}", loc='left', fontweight='bold')
    
    # 图2: 纵向G值 (帮助分析刹车)
    # 刹车是负G (红色填充), 加速是正G (绿色填充)
    ax2.plot(df['Distance(m)'], df['LongG'], color='gray', linewidth=0.8, alpha=0.5)
    ax2.fill_between(df['Distance(m)'], df['LongG'], 0, where=(df['LongG']<0), color='#e74c3c', alpha=0.5, label='Braking')
    ax2.fill_between(df['Distance(m)'], df['LongG'], 0, where=(df['LongG']>0), color='#2ecc71', alpha=0.3, label='Accel')
    
    ax2.axhline(0, color='black', linewidth=0.5)
    ax2.set_ylabel('Long G [g]', fontsize=10, fontweight='bold')
    ax2.set_xlabel('Distance [m]', fontsize=10, fontweight='bold')
    ax2.legend(loc='lower right', fontsize=8)
    
    setup_plot_style(ax1)
    setup_plot_style(ax2)
    
    plt.subplots_adjust(hspace=0.05)
    print("分析完成，正在显示图表...")
    plt.show()

def process_compare_logs(files):
    """双文件对比模式：速度对比 + Delta Time"""
    print(f"检测到两个文件，正在生成对比图表...")
    print(f"红色(基准): {files[0]}")
    print(f"蓝色(对比): {files[1]}")
    
    # 读取数据
    df1 = pd.read_csv(files[0]) # User A
    df2 = pd.read_csv(files[1]) # User B
    
    name1 = os.path.basename(files[0])
    name2 = os.path.basename(files[1])

    # --- Delta Time 核心算法 ---
    # 为了对比，必须统一距离轴 (以更长的那一圈为准，或者取最大公约距离)
    max_dist = min(df1['Distance(m)'].max(), df2['Distance(m)'].max())
    dist_grid = np.arange(0, max_dist, 1.0) # 每米一个点
    
    # 插值函数
    f1 = interp1d(df1['Distance(m)'], df1['Speed(km/h)'], fill_value="extrapolate")
    f2 = interp1d(df2['Distance(m)'], df2['Speed(km/h)'], fill_value="extrapolate")
    
    v1 = f1(dist_grid)
    v2 = f2(dist_grid)
    
    # 计算时间差
    # t = d / v
    # 避免速度为0导致除零错误
    v1 = np.maximum(v1, 1.0) 
    v2 = np.maximum(v2, 1.0)
    
    t1_seg = 1.0 / (v1 / 3.6) # 每米所需时间
    t2_seg = 1.0 / (v2 / 3.6)
    
    cum_t1 = np.cumsum(t1_seg)
    cum_t2 = np.cumsum(t2_seg)
    
    # Delta: 文件2 相对于 文件1 的时间差
    # 负数 = 文件2更快
    delta = cum_t2 - cum_t1 

    # --- 绘图 ---
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True, 
                                   gridspec_kw={'height_ratios': [3, 1]})
    
    # 上图：速度
    ax1.plot(df1['Distance(m)'], df1['Speed(km/h)'], color=LINE_COLORS[0], linewidth=1.2, label=name1)
    ax1.plot(df2['Distance(m)'], df2['Speed(km/h)'], color=LINE_COLORS[1], linewidth=1.2, label=name2)
    ax1.set_ylabel('Speed [km/h]', fontweight='bold')
    ax1.set_title("MoTeC Style Compare: Speed & Delta", loc='left', fontweight='bold')
    ax1.legend()
    
    # 下图：Delta
    ax2.plot(dist_grid, delta, color='#34495e', linewidth=1)
    # 填充颜色：
    # 如果 delta > 0 (曲线在0上方)，说明 文件2 慢了 (累计时间长)，红色警告
    # 如果 delta < 0 (曲线在0下方)，说明 文件2 快了，蓝色优势
    ax2.fill_between(dist_grid, delta, 0, where=(delta>0), color=LINE_COLORS[0], alpha=0.3) 
    ax2.fill_between(dist_grid, delta, 0, where=(delta<0), color=LINE_COLORS[1], alpha=0.3)
    ax2.axhline(0, color='black', linewidth=0.8)
    
    ax2.set_ylabel('Delta [s]', fontweight='bold')
    ax2.set_xlabel('Distance [m]', fontweight='bold')
    
    # 动态调整Y轴范围，让Delta看起来更清楚
    max_delta = np.max(np.abs(delta))
    ax2.set_ylim(-max_delta*1.1, max_delta*1.1)

    setup_plot_style(ax1)
    setup_plot_style(ax2)
    plt.subplots_adjust(hspace=0.05)
    
    print("对比完成，正在显示图表...")
    plt.show()

def main():
    # 1. 查找当前目录下的所有csv文件
    csv_files = glob.glob("*.csv")
    count = len(csv_files)
    
    print("="*30)
    print(f"MoTeC 风格数据分析器")
    print(f"当前目录下找到 CSV 文件数: {count}")
    print("="*30)
    
    if count == 0:
        print("错误: 当前目录下没有找到 .csv 文件。")
        print("请将数据文件放入此文件夹后重试。")
    elif count == 1:
        process_single_log(csv_files[0])
    elif count == 2:
        # 我们可以按文件名排序，保证 'A' 总是红色，'B' 总是蓝色，方便控制
        csv_files.sort() 
        process_compare_logs(csv_files)
    else:
        print(f"提示: 找到 {count} 个文件，暂不支持超过2个文件的自动对比。")
        print("请保留需要对比的两个文件，或指定单独文件。")
        print("文件列表:", csv_files)

if __name__ == "__main__":
    main()