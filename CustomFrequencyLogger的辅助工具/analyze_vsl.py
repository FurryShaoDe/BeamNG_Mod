import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import glob
import os
import math

# 设置绘图风格
plt.style.use('seaborn-v0_8-darkgrid')
plt.rcParams['figure.figsize'] = (14, 8)
plt.rcParams['lines.linewidth'] = 1.5

def clean_df(df):
    """清理数据：处理 Lua 的 nil 值，去除列名空格"""
    # 去除列名首尾空格
    df.columns = df.columns.str.strip()
    # 将 'nil' 替换为 NaN 并转换为浮点数
    df.replace('nil', np.nan, inplace=True)
    # 尝试将所有列转换为数字
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='ignore')
    return df

def plot_general_dynamics(general_file):
    if not os.path.exists(general_file): return
    print(f"正在分析: {general_file} ...")
    df = pd.read_csv(general_file)
    df = clean_df(df)
    
    # 创建画布：2x2
    fig, axs = plt.subplots(2, 2)
    fig.suptitle('Vehicle Dynamics & Track Map', fontsize=16)

    # 1. 赛道图 (X vs Y)
    if 'vehicle x-position' in df.columns and 'vehicle y-position' in df.columns:
        axs[0, 0].plot(df['vehicle x-position'], df['vehicle y-position'], color='black')
        axs[0, 0].set_title('Track Map (GPS Path)')
        axs[0, 0].set_aspect('equal', 'box')
        axs[0, 0].set_xlabel('X [m]')
        axs[0, 0].set_ylabel('Y [m]')
        # 标记起点
        axs[0, 0].plot(df['vehicle x-position'].iloc[0], df['vehicle y-position'].iloc[0], 'go', label='Start')
        axs[0, 0].legend()

    # 2. 速度与海拔
    ax2 = axs[0, 1]
    color = 'tab:blue'
    if 'velocity (m/s)' in df.columns:
        ax2.set_xlabel('Time [s]')
        ax2.set_ylabel('Speed [km/h]', color=color)
        ax2.plot(df['time'], df['velocity (m/s)'] * 3.6, color=color)
        ax2.tick_params(axis='y', labelcolor=color)

    if 'altitude' in df.columns:
        ax2_right = ax2.twinx()  # 双Y轴
        color = 'tab:orange'
        ax2_right.set_ylabel('Altitude [m]', color=color)
        ax2_right.plot(df['time'], df['altitude'], color=color, linestyle='--', alpha=0.6)
        ax2_right.tick_params(axis='y', labelcolor=color)
    axs[0, 1].set_title('Speed & Altitude')

    # 3. 车身姿态 (Roll/Pitch/Yaw)
    for col in ['roll (radians)', 'pitch (radians)']:
        if col in df.columns:
            axs[1, 0].plot(df['time'], df[col], label=col.split(' ')[0])
    axs[1, 0].set_title('Chassis Attitude (Roll/Pitch)')
    axs[1, 0].set_ylabel('Radians')
    axs[1, 0].legend()

    # 4. G值估算 (简单微分)
    if 'velocity (m/s)' in df.columns:
        dt = df['time'].diff().fillna(0.01)
        dv = df['velocity (m/s)'].diff().fillna(0)
        long_g = (dv / dt) / 9.81
        axs[1, 1].plot(df['time'], long_g.rolling(5).mean(), color='purple')
        axs[1, 1].set_title('Longitudinal G-Force')
        axs[1, 1].set_ylabel('G')
        axs[1, 1].axhline(0, color='gray', linestyle='--', linewidth=0.5)

    plt.tight_layout()
    plt.show()

def plot_engine_thermals(engine_file):
    if not os.path.exists(engine_file): return
    print(f"正在分析: {engine_file} ...")
    df = pd.read_csv(engine_file)
    df = clean_df(df)

    fig, axs = plt.subplots(3, 1, sharex=True, figsize=(12, 10))
    fig.suptitle('Engine Performance & Thermals', fontsize=16)

    # 1. 扭矩与负载
    if 'outputTorqueState' in df.columns: # 这里的列名可能需要根据你的csv微调
        # 注意：csv里可能有 lastOutputTorque
        if 'lastOutputTorque' in df.columns:
            axs[0].plot(df['time'], df['lastOutputTorque'], label='Torque [Nm]', color='red')
        if 'engineLoad' in df.columns:
            ax0_right = axs[0].twinx()
            ax0_right.plot(df['time'], df['engineLoad'], label='Load', color='blue', alpha=0.3, linestyle='--')
            ax0_right.set_ylabel('Engine Load [0-1]')
        axs[0].set_title('Engine Output')
        axs[0].legend(loc='upper left')

    # 2. 关键温度 (水温、油温、排气)
    temp_cols = {
        'thermals: coolantTemperature': 'Coolant',
        'thermals: oilTemperature': 'Oil',
        'thermals: exhaustTemperature': 'Exhaust',
        'thermals: engineBlockTemperature': 'Block'
    }
    
    for col, label in temp_cols.items():
        if col in df.columns:
            # 排气温度通常很高，可能需要单独看，或者放在一起看趋势
            axs[1].plot(df['time'], df[col], label=label)
    
    axs[1].set_title('Fluid & Component Temperatures [°C]')
    axs[1].legend()
    axs[1].grid(True)

    # 3. 热能量流 (高级分析) - 选几个能量交换画一下
    energy_cols = [c for c in df.columns if 'thermals: energy' in c]
    # 只选几个主要的，防止太乱
    main_energies = ['thermals: energyToOil', 'thermals: energyToCoolant', 'thermals: energyToExhaust']
    for col in energy_cols[:5]: # 或者画前5个
        axs[2].plot(df['time'], df[col], label=col.replace('thermals: ', ''))
    
    axs[2].set_title('Thermal Energy Transfer [J/s?]')
    axs[2].legend(fontsize='small', ncol=2)
    
    plt.tight_layout()
    plt.show()

def plot_wheels_detailed(wheels_file, general_file=None):
    if not os.path.exists(wheels_file): return
    print(f"正在分析: {wheels_file} ...")
    df_w = pd.read_csv(wheels_file)
    df_w = clean_df(df_w)
    
    # 尝试读取通用速度来做滑移率对比
    veh_speed = None
    if general_file and os.path.exists(general_file):
        df_g = pd.read_csv(general_file)
        df_g = clean_df(df_g)
        # 简单对齐时间
        veh_speed = df_g['velocity (m/s)']

    fig, axs = plt.subplots(3, 1, sharex=True, figsize=(12, 12))
    fig.suptitle('Wheels & Brakes Analysis', fontsize=16)

    # 定义轮子前缀
    wheels = ['FL', 'FR', 'RL', 'RR']
    colors = {'FL': 'tab:blue', 'FR': 'tab:orange', 'RL': 'tab:green', 'RR': 'tab:red'}

    # 1. 轮速对比 (检测打滑/抱死)
    for w in wheels:
        col_name = f"{w}: wheelSpeed" # 假设是这样的格式，需要根据csv实际内容调整，你的csv是 "FR: wheelSpeed"
        # 你的CSV里有空格吗？上面的clean_df已经去除了首尾空格
        # 再次确认列名格式
        col_candidates = [c for c in df_w.columns if w in c and 'wheelSpeed' in c]
        if col_candidates:
            axs[0].plot(df_w['time'], df_w[col_candidates[0]], label=f'{w} Speed', color=colors[w], linewidth=1)
    
    if veh_speed is not None:
        axs[0].plot(df_w['time'], veh_speed, 'k--', label='Vehicle Speed', linewidth=2, alpha=0.6)
        
    axs[0].set_title('Wheel Speeds vs Vehicle Speed (Slip Detection)')
    axs[0].set_ylabel('m/s')
    axs[0].legend(ncol=5)

    # 2. 刹车温度
    for w in wheels:
        col_candidates = [c for c in df_w.columns if w in c and 'brakeCoreTemperature' in c]
        if col_candidates:
            axs[1].plot(df_w['time'], df_w[col_candidates[0]], label=f'{w} Brake Temp', color=colors[w])
    
    axs[1].set_title('Brake Core Temperatures [°C]')
    axs[1].legend(ncol=4)

    # 3. 轮上扭矩 (Propulsion Torque)
    for w in wheels:
        col_candidates = [c for c in df_w.columns if w in c and 'propulsionTorque' in c]
        # 有可能重复列名，取第一个
        if col_candidates:
            axs[2].plot(df_w['time'], df_w[col_candidates[0]], label=f'{w} Torque', color=colors[w], alpha=0.8)

    axs[2].set_title('Wheel Propulsion Torque [Nm]')
    axs[2].set_xlabel('Time [s]')
    axs[2].legend(ncol=4)

    plt.tight_layout()
    plt.show()

def main():
    print("=== BeamNG 全面数据可视化工具 ===")
    
    # 定义文件名 (确保这些文件在当前目录下)
    files = {
        'General': 'General.csv',
        'Engine': 'Engine.csv',
        'Wheels': 'Wheels.csv',
        'Inputs': 'Inputs.csv'
    }

    # 1. 基础动力学分析
    plot_general_dynamics(files['General'])

    # 2. 引擎与热管理分析
    plot_engine_thermals(files['Engine'])

    # 3. 轮胎与刹车分析
    plot_wheels_detailed(files['Wheels'], files['General'])

    print("所有图表生成完毕。")

if __name__ == "__main__":
    main()