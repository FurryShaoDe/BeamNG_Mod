import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os
import glob
from scipy import interpolate

# 设置中文字体和图表样式
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False
plt.style.use('ggplot')

# ====================== 功能1: 单文件分析 ======================
def analyze_single_file(csv_file):
    """分析单个CSV文件并绘制图表"""
    print(f"\n正在处理单个文件: {csv_file}")
    
    # 读取CSV文件
    df = pd.read_csv(csv_file)
    
    # 提取数据
    time = df['Time(s)']
    distance = df['Distance(m)']
    speed = df['Speed(km/h)']
    
    # 计算最快速度及其位置
    max_speed = speed.max()
    max_speed_time_index = speed.idxmax()
    max_speed_time = time[max_speed_time_index]
    max_speed_distance = distance[max_speed_time_index]
    
    # 创建图表
    fig, axes = plt.subplots(2, 1, figsize=(14, 10))
    
    # 图表1: 距离-速度曲线
    axes[0].plot(distance, speed, linewidth=2, color='blue', alpha=0.7)
    axes[0].scatter(max_speed_distance, max_speed, color='red', s=100, 
                   zorder=5, label=f'最快速度: {max_speed:.2f} km/h')
    axes[0].set_xlabel('距离 (m)', fontsize=12)
    axes[0].set_ylabel('速度 (km/h)', fontsize=12)
    axes[0].set_title(f'{os.path.basename(csv_file)} - 距离-速度曲线', fontsize=14, fontweight='bold')
    axes[0].grid(True, alpha=0.3)
    axes[0].legend(loc='best')
    axes[0].fill_between(distance, speed, alpha=0.2, color='blue')
    
    # 修改顶点标注：只显示距离
    axes[0].annotate(f'{max_speed_distance:.1f} m', 
                    xy=(max_speed_distance, max_speed), 
                    xytext=(max_speed_distance+10, max_speed-5),
                    arrowprops=dict(arrowstyle='->', color='red', lw=1.5),
                    fontsize=10, color='red', fontweight='bold',
                    bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.7))
    
    # 图表2: 距离-时间曲线 (已修改)
    axes[1].plot(distance, time, linewidth=2, color='green', alpha=0.7)
    axes[1].scatter(max_speed_distance, max_speed_time, color='red', s=100, 
                   zorder=5, label=f'最快速度点')
    axes[1].set_xlabel('距离 (m)', fontsize=12)
    axes[1].set_ylabel('时间 (s)', fontsize=12)
    axes[1].set_title(f'{os.path.basename(csv_file)} - 距离-时间曲线', fontsize=14, fontweight='bold')
    axes[1].grid(True, alpha=0.3)
    axes[1].legend(loc='best')
    axes[1].fill_between(distance, time, alpha=0.2, color='green')
    
    # 修改顶点标注：只显示时间
    axes[1].annotate(f'{max_speed_time:.2f} s', 
                    xy=(max_speed_distance, max_speed_time), 
                    xytext=(max_speed_distance+10, max_speed_time+1),
                    arrowprops=dict(arrowstyle='->', color='red', lw=1.5),
                    fontsize=10, color='red', fontweight='bold',
                    bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.7))
    
    # 调整布局
    plt.tight_layout()
    
    # 显示最快速度信息
    print("最快速度信息:")
    print(f"  最快速度: {max_speed:.2f} km/h")
    print(f"  发生时间: {max_speed_time:.2f} s")
    print(f"  发生距离: {max_speed_distance:.2f} m")
    
    # 保存图表
    output_filename = f"single_analysis_{os.path.splitext(os.path.basename(csv_file))[0]}.png"
    plt.savefig(output_filename, dpi=150, bbox_inches='tight')
    print(f"图表已保存为: {output_filename}")
    
    # 显示图表
    plt.show()
    
    return max_speed, max_speed_time, max_speed_distance

# ====================== 功能2: 双文件对比 ======================
def compare_two_files(csv_file1, csv_file2, sync_method='distance', offset=0, manual_time_offset=0):
    """比较两个CSV文件并绘制对比图表
    
    参数:
    csv_file1: 第一个CSV文件路径
    csv_file2: 第二个CSV文件路径
    sync_method: 同步方法，'distance'(距离同步)或'time'(时间同步)
    offset: 距离偏移量(米)或时间偏移量(秒)，用于手动调整
    manual_time_offset: 额外的手动时间偏移(秒)
    """
    print(f"\n正在对比两个文件:")
    print(f"  文件1: {csv_file1}")
    print(f"  文件2: {csv_file2}")
    
    # 读取两个CSV文件
    df1 = pd.read_csv(csv_file1)
    df2 = pd.read_csv(csv_file2)
    
    # 提取数据
    time1 = df1['Time(s)'].values
    distance1 = df1['Distance(m)'].values
    speed1 = df1['Speed(km/h)'].values
    
    time2 = df2['Time(s)'].values
    distance2 = df2['Distance(m)'].values
    speed2 = df2['Speed(km/h)'].values
    
    # 应用手动时间偏移
    if manual_time_offset != 0:
        print(f"  应用手动时间偏移: {manual_time_offset:.2f}秒")
        time2 = time2 + manual_time_offset
    
    # 方法1: 距离同步
    if sync_method == 'distance':
        print(f"  使用距离同步方法")
        
        # 找出共同的距离范围
        min_dist = max(min(distance1), min(distance2))
        max_dist = min(max(distance1), max(distance2))
        
        # 对两个数据集在共同距离范围内进行插值
        common_distance = np.linspace(min_dist, max_dist, 1000)
        
        # 创建插值函数
        f1 = interpolate.interp1d(distance1, speed1, kind='linear', bounds_error=False, fill_value='extrapolate')
        f2 = interpolate.interp1d(distance2, speed2, kind='linear', bounds_error=False, fill_value='extrapolate')
        
        # 应用距离偏移
        if offset != 0:
            print(f"  应用距离偏移: {offset:.2f}米")
            common_distance_adj = common_distance + offset
        else:
            common_distance_adj = common_distance
            
        # 计算插值后的速度
        speed1_interp = f1(common_distance)
        speed2_interp = f2(common_distance_adj)
        
        # 创建对比图表
        fig, axes = plt.subplots(2, 1, figsize=(14, 10))
        
        # 图表1: 距离-速度对比
        axes[0].plot(distance1, speed1, linewidth=2, color='blue', alpha=0.7, label=f'{os.path.basename(csv_file1)}')
        axes[0].plot(distance2 + offset, speed2, linewidth=2, color='red', alpha=0.7, label=f'{os.path.basename(csv_file2)}')
        axes[0].set_xlabel('距离 (m)', fontsize=12)
        axes[0].set_ylabel('速度 (km/h)', fontsize=12)
        axes[0].set_title(f'距离-速度对比 (距离偏移: {offset}m)', fontsize=14, fontweight='bold')
        axes[0].grid(True, alpha=0.3)
        axes[0].legend(loc='best')
        
        # 图表2: 同步后的速度差值
        axes[1].plot(common_distance, speed1_interp - speed2_interp, linewidth=2, color='purple', alpha=0.7)
        axes[1].axhline(y=0, color='gray', linestyle='--', alpha=0.5)
        axes[1].set_xlabel('距离 (m)', fontsize=12)
        axes[1].set_ylabel('速度差值 (km/h)', fontsize=12)
        axes[1].set_title(f'速度差值 (正值表示文件1更快)', fontsize=14, fontweight='bold')
        axes[1].grid(True, alpha=0.3)
        axes[1].fill_between(common_distance, 0, speed1_interp - speed2_interp, 
                           where=(speed1_interp - speed2_interp) > 0, alpha=0.3, color='green', label='文件1更快')
        axes[1].fill_between(common_distance, 0, speed1_interp - speed2_interp, 
                           where=(speed1_interp - speed2_interp) < 0, alpha=0.3, color='red', label='文件2更快')
        axes[1].legend(loc='best')
    
    # 方法2: 时间同步
    elif sync_method == 'time':
        print(f"  使用时间同步方法")
        
        # 找出共同的时间范围
        min_time = max(min(time1), min(time2))
        max_time = min(max(time1), max(time2))
        
        # 对两个数据集在共同时间范围内进行插值
        common_time = np.linspace(min_time, max_time, 1000)
        
        # 创建插值函数
        f1 = interpolate.interp1d(time1, speed1, kind='linear', bounds_error=False, fill_value='extrapolate')
        f2 = interpolate.interp1d(time2, speed2, kind='linear', bounds_error=False, fill_value='extrapolate')
        
        # 应用时间偏移
        if offset != 0:
            print(f"  应用时间偏移: {offset:.2f}秒")
            common_time_adj = common_time + offset
        else:
            common_time_adj = common_time
            
        # 计算插值后的速度
        speed1_interp = f1(common_time)
        speed2_interp = f2(common_time_adj)
        
        # 创建对比图表
        fig, axes = plt.subplots(2, 1, figsize=(14, 10))
        
        # 图表1: 时间-速度对比
        axes[0].plot(time1, speed1, linewidth=2, color='blue', alpha=0.7, label=f'{os.path.basename(csv_file1)}')
        axes[0].plot(time2 + offset, speed2, linewidth=2, color='red', alpha=0.7, label=f'{os.path.basename(csv_file2)}')
        axes[0].set_xlabel('时间 (s)', fontsize=12)
        axes[0].set_ylabel('速度 (km/h)', fontsize=12)
        axes[0].set_title(f'时间-速度对比 (时间偏移: {offset}s)', fontsize=14, fontweight='bold')
        axes[0].grid(True, alpha=0.3)
        axes[0].legend(loc='best')
        
        # 图表2: 同步后的速度差值
        axes[1].plot(common_time, speed1_interp - speed2_interp, linewidth=2, color='purple', alpha=0.7)
        axes[1].axhline(y=0, color='gray', linestyle='--', alpha=0.5)
        axes[1].set_xlabel('时间 (s)', fontsize=12)
        axes[1].set_ylabel('速度差值 (km/h)', fontsize=12)
        axes[1].set_title(f'速度差值 (正值表示文件1更快)', fontsize=14, fontweight='bold')
        axes[1].grid(True, alpha=0.3)
        axes[1].fill_between(common_time, 0, speed1_interp - speed2_interp, 
                           where=(speed1_interp - speed2_interp) > 0, alpha=0.3, color='green', label='文件1更快')
        axes[1].fill_between(common_time, 0, speed1_interp - speed2_interp, 
                           where=(speed1_interp - speed2_interp) < 0, alpha=0.3, color='red', label='文件2更快')
        axes[1].legend(loc='best')
    
    # 调整布局
    plt.tight_layout()
    
    # 显示统计信息
    print("\n对比统计信息:")
    print(f"  文件1最快速度: {speed1.max():.2f} km/h")
    print(f"  文件2最快速度: {speed2.max():.2f} km/h")
    print(f"  速度差: {speed1.max() - speed2.max():.2f} km/h")
    
    # 保存图表
    output_filename = f"comparison_{os.path.splitext(os.path.basename(csv_file1))[0]}_vs_{os.path.splitext(os.path.basename(csv_file2))[0]}.png"
    plt.savefig(output_filename, dpi=150, bbox_inches='tight')
    print(f"对比图表已保存为: {output_filename}")
    
    # 显示图表
    plt.show()
    
    return speed1, speed2

# ====================== 功能3: 添加时间-距离曲线对比 ======================
def compare_distance_time_curves(csv_file1, csv_file2, offset=0):
    """比较两个文件的距离-时间曲线"""
    print(f"\n正在对比两个文件的距离-时间曲线:")
    print(f"  文件1: {csv_file1}")
    print(f"  文件2: {csv_file2}")
    
    # 读取两个CSV文件
    df1 = pd.read_csv(csv_file1)
    df2 = pd.read_csv(csv_file2)
    
    # 提取数据
    time1 = df1['Time(s)'].values
    distance1 = df1['Distance(m)'].values
    speed1 = df1['Speed(km/h)'].values
    
    time2 = df2['Time(s)'].values
    distance2 = df2['Distance(m)'].values
    speed2 = df2['Speed(km/h)'].values
    
    # 找出共同的距离范围
    min_dist = max(min(distance1), min(distance2))
    max_dist = min(max(distance1), max(distance2))
    
    # 对两个数据集在共同距离范围内进行插值
    common_distance = np.linspace(min_dist, max_dist, 1000)
    
    # 创建插值函数：距离->时间
    f1_time = interpolate.interp1d(distance1, time1, kind='linear', bounds_error=False, fill_value='extrapolate')
    f2_time = interpolate.interp1d(distance2, time2, kind='linear', bounds_error=False, fill_value='extrapolate')
    
    # 创建插值函数：距离->速度
    f1_speed = interpolate.interp1d(distance1, speed1, kind='linear', bounds_error=False, fill_value='extrapolate')
    f2_speed = interpolate.interp1d(distance2, speed2, kind='linear', bounds_error=False, fill_value='extrapolate')
    
    # 应用距离偏移
    if offset != 0:
        print(f"  应用距离偏移: {offset:.2f}米")
        common_distance_adj = common_distance + offset
    else:
        common_distance_adj = common_distance
    
    # 计算插值后的时间和速度
    time1_interp = f1_time(common_distance)
    time2_interp = f2_time(common_distance_adj)
    
    speed1_interp = f1_speed(common_distance)
    speed2_interp = f2_speed(common_distance_adj)
    
    # 创建对比图表
    fig, axes = plt.subplots(2, 1, figsize=(14, 10))
    
    # 图表1: 距离-时间对比
    axes[0].plot(distance1, time1, linewidth=2, color='blue', alpha=0.7, label=f'{os.path.basename(csv_file1)}')
    axes[0].plot(distance2 + offset, time2, linewidth=2, color='red', alpha=0.7, label=f'{os.path.basename(csv_file2)}')
    axes[0].set_xlabel('距离 (m)', fontsize=12)
    axes[0].set_ylabel('时间 (s)', fontsize=12)
    axes[0].set_title(f'距离-时间曲线对比 (距离偏移: {offset}m)', fontsize=14, fontweight='bold')
    axes[0].grid(True, alpha=0.3)
    axes[0].legend(loc='best')
    
    # 图表2: 时间差值（文件1 - 文件2，负值表示文件1更快）
    axes[1].plot(common_distance, time1_interp - time2_interp, linewidth=2, color='purple', alpha=0.7)
    axes[1].axhline(y=0, color='gray', linestyle='--', alpha=0.5)
    axes[1].set_xlabel('距离 (m)', fontsize=12)
    axes[1].set_ylabel('时间差值 (s)', fontsize=12)
    axes[1].set_title(f'时间差值 (负值表示文件1更快)', fontsize=14, fontweight='bold')
    axes[1].grid(True, alpha=0.3)
    axes[1].fill_between(common_distance, 0, time1_interp - time2_interp, 
                       where=(time1_interp - time2_interp) < 0, alpha=0.3, color='green', label='文件1更快')
    axes[1].fill_between(common_distance, 0, time1_interp - time2_interp, 
                       where=(time1_interp - time2_interp) > 0, alpha=0.3, color='red', label='文件2更快')
    axes[1].legend(loc='best')
    
    # 调整布局
    plt.tight_layout()
    
    # 显示统计信息
    print("\n对比统计信息:")
    total_time1 = time1[-1]
    total_time2 = time2[-1]
    print(f"  文件1总时间: {total_time1:.2f} s")
    print(f"  文件2总时间: {total_time2:.2f} s")
    print(f"  时间差: {total_time1 - total_time2:.2f} s")
    
    # 保存图表
    output_filename = f"distance_time_comparison_{os.path.splitext(os.path.basename(csv_file1))[0]}_vs_{os.path.splitext(os.path.basename(csv_file2))[0]}.png"
    plt.savefig(output_filename, dpi=150, bbox_inches='tight')
    print(f"对比图表已保存为: {output_filename}")
    
    # 显示图表
    plt.show()

# ====================== 交互界面 ======================
def main():
    """主函数：提供交互式界面"""
    # 自动扫描当前文件夹下的CSV文件
    csv_files = glob.glob('*.csv')
    
    if not csv_files:
        print("当前文件夹中没有找到CSV文件")
        return
    
    print(f"找到 {len(csv_files)} 个CSV文件:")
    for i, file in enumerate(csv_files, 1):
        print(f"{i}. {file}")
    
    print("\n请选择操作:")
    print("1. 单文件分析")
    print("2. 双文件速度对比")
    print("3. 双文件距离-时间对比")
    
    choice = input("请输入选项 (1, 2 或 3): ").strip()
    
    if choice == '1':
        # 单文件分析
        file_idx = int(input(f"请选择要分析的文件 (1-{len(csv_files)}): ")) - 1
        if 0 <= file_idx < len(csv_files):
            analyze_single_file(csv_files[file_idx])
        else:
            print("无效的文件选择")
    
    elif choice == '2':
        # 双文件速度对比
        print(f"\n选择第一个文件:")
        file1_idx = int(input(f"请输入编号 (1-{len(csv_files)}): ")) - 1
        print(f"\n选择第二个文件:")
        file2_idx = int(input(f"请输入编号 (1-{len(csv_files)}): ")) - 1
        
        if 0 <= file1_idx < len(csv_files) and 0 <= file2_idx < len(csv_files):
            csv_file1 = csv_files[file1_idx]
            csv_file2 = csv_files[file2_idx]
            
            print("\n请选择同步方法:")
            print("1. 距离同步 (基于距离对齐数据)")
            print("2. 时间同步 (基于时间对齐数据)")
            sync_choice = input("请输入选项 (1 或 2): ").strip()
            
            sync_method = 'distance' if sync_choice == '1' else 'time'
            
            # 询问是否应用偏移
            apply_offset = input("是否应用偏移量? (y/n): ").strip().lower()
            offset = 0
            manual_time_offset = 0
            
            if apply_offset == 'y':
                if sync_method == 'distance':
                    offset = float(input("请输入距离偏移量(米) (正数表示文件2向右偏移): "))
                else:
                    offset = float(input("请输入时间偏移量(秒) (正数表示文件2向右偏移): "))
                
                # 询问是否应用额外的手动时间偏移
                extra_time_offset = input("是否应用额外的手动时间偏移? (y/n): ").strip().lower()
                if extra_time_offset == 'y':
                    manual_time_offset = float(input("请输入手动时间偏移量(秒) (正数表示文件2延迟): "))
            
            # 执行对比
            compare_two_files(csv_file1, csv_file2, sync_method, offset, manual_time_offset)
        else:
            print("无效的文件选择")
    
    elif choice == '3':
        # 双文件距离-时间对比
        print(f"\n选择第一个文件:")
        file1_idx = int(input(f"请输入编号 (1-{len(csv_files)}): ")) - 1
        print(f"\n选择第二个文件:")
        file2_idx = int(input(f"请输入编号 (1-{len(csv_files)}): ")) - 1
        
        if 0 <= file1_idx < len(csv_files) and 0 <= file2_idx < len(csv_files):
            csv_file1 = csv_files[file1_idx]
            csv_file2 = csv_files[file2_idx]
            
            # 询问是否应用偏移
            apply_offset = input("是否应用距离偏移量? (y/n): ").strip().lower()
            offset = 0
            
            if apply_offset == 'y':
                offset = float(input("请输入距离偏移量(米) (正数表示文件2向右偏移): "))
            
            # 执行对比
            compare_distance_time_curves(csv_file1, csv_file2, offset)
        else:
            print("无效的文件选择")
    
    else:
        print("无效的选项")

# ====================== 执行主程序 ======================
if __name__ == "__main__":
    main()