from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "task_user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    tasks = relationship("Task", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)  # ✨ New Field
    priority = Column(String) 
    due_date = Column(Date, default=datetime.date.today) # ✨ New Field
    completed = Column(Boolean, default=False) # ✅ You asked for this (it's here!)
    
    owner_id = Column(Integer, ForeignKey("task_user.id"))
    owner = relationship("User", back_populates="tasks")