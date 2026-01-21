from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime

from src.core.database import get_session
from src.core.auth import get_current_user_id
from src.models.task import Task, User
from src.schemas.tasks import TaskUpdate


router = APIRouter()

@router.post("/api/tasks", response_model=Task)
def create_task(
    task: Task,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):

    # Get the latest task to determine the next ID
    latest_task = session.exec(
        select(Task).order_by(Task.id.desc())
    ).first()

    if latest_task:
        latest_id = int(latest_task.id)
        new_id = latest_id + 1
    else:
        new_id = 1
    
    # Format the ID as a three-digit string
    new_id_str = f"{new_id:03}"

    # Ensure the task is assigned to the correct user
    db_task = Task(
        id=new_id_str,
        user_id=current_user_id,
        title=task.title,
        description=task.description,
        completed=task.completed if task.completed is not None else False,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/api/tasks", response_model=List[Task])
def get_tasks(
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    sort_by: str = Query("id"),
    sort_order: str = Query("asc")
):

    # Validate sort_by parameter to prevent injection
    allowed_sort_fields = ["id", "title", "completed", "created_at", "updated_at"]
    if sort_by not in allowed_sort_fields:
        sort_by = "id"

    # Build order clause
    order_field = getattr(Task, sort_by)
    if sort_order.lower() == "desc":
        order_clause = order_field.desc()
    else:
        order_clause = order_field.asc()

    tasks = session.exec(
        select(Task)
        .where(Task.user_id == current_user_id)
        .order_by(order_clause)
        .offset(offset)
        .limit(limit)
    ).all()
    return tasks

@router.get("/api/tasks/{task_id}", response_model=Task)
def get_task_by_id(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):

    task = session.exec(
        select(Task)
        .where(Task.id == task_id, Task.user_id == current_user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/api/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    task: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):

    db_task = session.exec(
        select(Task)
        .where(Task.id == task_id, Task.user_id == current_user_id)
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update fields
    task_data = task.model_dump(exclude_unset=True)
    for key, value in task_data.items():
        setattr(db_task, key, value)

    # Update the updated_at timestamp
    db_task.updated_at = datetime.now()

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.delete("/api/tasks/{task_id}")
def delete_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):

    task = session.exec(
        select(Task)
        .where(Task.id == task_id, Task.user_id == current_user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()
    return {"message": "Task deleted successfully"}

@router.patch("/api/tasks/{task_id}/complete", response_model=Task)
def complete_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):

    db_task = session.exec(
        select(Task)
        .where(Task.id == task_id, Task.user_id == current_user_id)
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.completed = True
    db_task.updated_at = datetime.now()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task