"""
Show Training History
Displays all training sessions with timestamps and metrics
"""

import json
import os
from datetime import datetime

def show_training_history():
    """Display training history from log file"""
    
    print("\n" + "=" * 60)
    print("📜 AI Model Training History")
    print("=" * 60)
    
    history_file = 'training_history.json'
    
    if not os.path.exists(history_file):
        print("\n⚠️  No training history found yet.")
        print("Training history will be created when you train the model.")
        
        # Check if model exists
        if os.path.exists('models/size_recommender.pkl'):
            file_stats = os.stat('models/size_recommender.pkl')
            modified_time = datetime.fromtimestamp(file_stats.st_mtime)
            
            print("\n📊 Current Model Information:")
            print(f"  Last trained: {modified_time.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"  File size: {file_stats.st_size / (1024 * 1024):.2f} MB")
        
        print("\nTo create training history, run:")
        print("  python train_size_model.py")
        return
    
    # Load history
    try:
        with open(history_file, 'r') as f:
            history = json.load(f)
        
        if not history:
            print("\n⚠️  Training history is empty.")
            return
        
        print(f"\n📈 Total Training Sessions: {len(history)}")
        print()
        
        # Display each session
        for i, session in enumerate(history, 1):
            print("─" * 60)
            print(f"Training Session {i}:")
            print(f"  📅 Date: {session['timestamp']}")
            print(f"  📊 Training Samples: {session['training_samples']}")
            print(f"  🎯 Training Accuracy: {session['training_accuracy']:.2f}%")
            print(f"  ✅ Testing Accuracy: {session['testing_accuracy']:.2f}%")
            print(f"  ⏱️  Duration: {session['duration']:.2f} seconds")
            
            if 'notes' in session:
                print(f"  📝 Notes: {session['notes']}")
            
            print()
        
        # Show improvement
        if len(history) > 1:
            first_accuracy = history[0]['testing_accuracy']
            last_accuracy = history[-1]['testing_accuracy']
            improvement = last_accuracy - first_accuracy
            
            print("=" * 60)
            print("📈 Progress Summary")
            print("=" * 60)
            print(f"\n  First Model: {first_accuracy:.2f}%")
            print(f"  Latest Model: {last_accuracy:.2f}%")
            print(f"  Improvement: {improvement:+.2f}%")
            
            if improvement > 0:
                print(f"\n  🎉 Great job! Your model improved by {improvement:.2f}%!")
            elif improvement < 0:
                print(f"\n  ⚠️  Accuracy decreased. Consider using more training data.")
            else:
                print(f"\n  ➡️  Accuracy remained the same.")
        
        print()
        
    except Exception as e:
        print(f"\n❌ Error reading training history: {e}")


def add_training_record(training_samples, training_accuracy, testing_accuracy, 
                       duration, notes=""):
    """Add a new training record to history"""
    
    history_file = 'training_history.json'
    
    # Load existing history
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            history = json.load(f)
    else:
        history = []
    
    # Create new record
    record = {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'training_samples': training_samples,
        'training_accuracy': round(training_accuracy * 100, 2),
        'testing_accuracy': round(testing_accuracy * 100, 2),
        'duration': round(duration, 2),
        'notes': notes
    }
    
    # Add to history
    history.append(record)
    
    # Save
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)
    
    print(f"✓ Training record added to history")


if __name__ == "__main__":
    show_training_history()
