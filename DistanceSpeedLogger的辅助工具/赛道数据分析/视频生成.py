import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.animation import FuncAnimation, FFMpegWriter
from datetime import datetime
import os

def create_exact_time_video(csv_file_path, output_video_path=None, target_fps=30):
    """
    创建精确时间控制的视频
    
    参数:
    csv_file_path: CSV文件路径
    output_video_path: 输出视频路径，如果为None则自动生成
    target_fps: 目标帧率，默认30fps
    """
    
    # 读取数据
    df = pd.read_csv(csv_file_path)
    df = df.sort_values('Time(s)')
    
    time_data = df['Time(s)'].values
    distance_data = df['Distance(m)'].values
    speed_data = df['Speed(km/h)'].values
    
    # 计算总时长和所需帧数
    total_time = time_data[-1] - time_data[0]
    total_frames_needed = int(total_time * target_fps)
    
    print(f"数据信息:")
    print(f"  数据点数: {len(time_data)}")
    print(f"  总时长: {total_time:.3f} 秒")
    print(f"  目标fps: {target_fps}")
    print(f"  需要生成帧数: {total_frames_needed}")
    
    # 对数据进行插值，以匹配目标fps
    # 创建均匀的时间轴
    uniform_time = np.linspace(time_data[0], time_data[-1], total_frames_needed)
    
    # 对距离和速度进行线性插值
    interp_distance = np.interp(uniform_time, time_data, distance_data)
    interp_speed = np.interp(uniform_time, time_data, speed_data)
    
    # 创建图形
    fig, ax = plt.subplots(figsize=(12, 8))
    fig.suptitle('Distance vs Speed Over Time', fontsize=16, fontweight='bold')
    
    # 初始化元素
    line, = ax.plot([], [], 'b-', linewidth=2, label='Distance-Speed Curve')
    point, = ax.plot([], [], 'ro', markersize=8, label='Current Point')
    
    ax.set_xlabel('Distance (m)', fontsize=14)
    ax.set_ylabel('Speed (km/h)', fontsize=14)
    ax.set_title('Real-time Distance vs Speed Relationship', fontsize=14)
    
    # 设置坐标轴范围
    margin_x = (max(distance_data) - min(distance_data)) * 0.05
    margin_y = (max(speed_data) - min(speed_data)) * 0.05
    ax.set_xlim(min(distance_data) - margin_x, max(distance_data) + margin_x)
    ax.set_ylim(min(speed_data) - margin_y, max(speed_data) + margin_y)
    
    ax.grid(True, alpha=0.3)
    ax.legend(loc='upper right', fontsize=12)
    
    # 文本显示
    time_text = ax.text(0.02, 0.95, '', transform=ax.transAxes, fontsize=12,
                       bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
    stats_text = ax.text(0.02, 0.88, '', transform=ax.transAxes, fontsize=10,
                        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    def init():
        line.set_data([], [])
        point.set_data([], [])
        time_text.set_text('')
        stats_text.set_text('')
        return line, point, time_text, stats_text
    
    def update(frame):
        # 使用插值后的数据
        current_time = uniform_time[frame]
        current_distance = interp_distance[frame]
        current_speed = interp_speed[frame]
        
        # 更新曲线
        line.set_data(interp_distance[:frame+1], interp_speed[:frame+1])
        point.set_data([current_distance], [current_speed])
        
        # 找到最接近的原始数据点
        closest_idx = np.argmin(np.abs(time_data - current_time))
        original_time = time_data[closest_idx]
        
        time_text.set_text(f'Time: {original_time:.2f} s (Video: {current_time:.2f} s)')
        
        stats_text.set_text(
            f'Distance: {interp_distance[frame]:.2f} m\n'
            f'Speed: {interp_speed[frame]:.2f} km/h\n'
            f'Frame: {frame+1}/{total_frames_needed}'
        )
        
        return line, point, time_text, stats_text
    
    # 创建动画
    ani = FuncAnimation(fig, update, frames=total_frames_needed,
                        init_func=init, blit=True, interval=1000/target_fps)
    
    # 生成输出文件名
    if output_video_path is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_video_path = f"distance_speed_{timestamp}.mp4"
    
    # 保存视频
    print(f"\n正在生成视频...")
    writer = FFMpegWriter(fps=target_fps, metadata=dict(artist='Python'), bitrate=1800)
    ani.save(output_video_path, writer=writer, dpi=100)
    
    print(f"视频已保存: {output_video_path}")
    print(f"视频时长: {total_time:.2f} 秒")
    print(f"视频帧率: {target_fps} fps")
    print(f"视频帧数: {total_frames_needed}")
    
    plt.close(fig)
    return output_video_path

# 使用示例
if __name__ == "__main__":
    csv_file = "distance_speed_log_2026-01-07T10-38-25.csv"
    
    if os.path.exists(csv_file):
        # 创建精确时长的视频
        video_file = create_exact_time_video(
            csv_file, 
            output_video_path="distance_speed_exact_time.mp4",
            target_fps=30  # 可以调整帧率，30fps是标准视频帧率
        )
        print(f"\n视频文件: {video_file}")
    else:
        print(f"文件不存在: {csv_file}")