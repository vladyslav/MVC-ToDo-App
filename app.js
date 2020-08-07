class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  bindToDoListChanged = (callback) => (this.onToDoListChanged = callback);

  commit(todos) {
    this.onToDoListChanged(todos);
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  addToDo(newToDo) {
    const todo = {
      id: this.todos.length <= 0 ? 1 : this.todos.length + 1,
      todo: newToDo,
      done: false
    };

    this.todos.push(todo);
    this.commit(this.todos);
  }

  editToDo(id, editedToDo) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { id: todo.id, todo: editedToDo, done: todo.done } : todo
    );
    this.commit(this.todos);
  }

  deleteToDo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.commit(this.todos);
  }

  toggleToDo(id) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { id: todo.id, todo: todo.todo, done: !todo.done } : todo
    );
    this.commit(this.todos);
  }
}

class View {
  constructor() {
    this.app = this.getElement('#root');
    this.title = this.createElement('h1');
    this.title.textContent = 'Welcome to MVC ToDo List';
    this.input = this.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Today I need to do...';
    this.input.name = 'todo';
    this.input.id = 'todo';
    this.todoList = this.createElement('ul', 'todo-list');
    document.body.prepend(this.title);
    this.app.append(this.input, this.todoList);
    this._temporaryTodoText = '';
    this.initLocalListeners();
  }

  get todoText() {
    return this.input.value;
  }

  resetInput = () => (this.input.value = '');

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    return element;
  }

  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }

  displayTodos(todos) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }

    if (todos.length === 0) {
      const p = this.createElement('p');
      p.textContent = 'Nothing to do! Add a todo?';
      this.todoList.append(p);
    } else {
      todos.forEach((todo) => {
        const li = this.createElement('li');
        li.id = todo.id;

        const checkbox = this.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.done;

        const span = this.createElement('span');
        span.contentEditable = true;
        span.classList.add('editable');

        if (todo.done) {
          const strike = this.createElement('s');
          strike.textContent = todo.id + '. ' + todo.todo;
          span.append(strike);
        } else {
          span.textContent = todo.id + '. ' + todo.todo;
        }

        const deleteButton = this.createElement('button', 'delete');
        deleteButton.textContent = 'Delete';
        li.append(span, checkbox, deleteButton);

        this.todoList.append(li);
      });
    }
  }

  initLocalListeners() {
    this.todoList.addEventListener('input', (event) => {
      if (event.target.className === 'editable') {
        this._temporaryTodoText = event.target.innerText;
      }
    });
  }

  bindAddTodo(handler) {
    this.input.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        if (
          document.getElementById('todo').value != '' &&
          document.getElementById('todo').value != ' ' &&
          this.todoText
        ) {
          handler(this.todoText);
          this.resetInput();
        }
      }
    });
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', (event) => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', (event) => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id);
        handler(id, this._temporaryTodoText);
        this._temporaryTodoText = '';
      }
    });
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', (event) => {
      if (event.target.type === 'checkbox') {
        console.log(event.target.parentElement.id);
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.model.bindToDoListChanged(this.onToDoListChanged);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindEditTodo(this.handleEditTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.onToDoListChanged(this.model.todos);
  }

  onToDoListChanged = (todos) => this.view.displayTodos(todos);
  handleAddTodo = (newToDo) => this.model.addToDo(newToDo);
  handleEditTodo = (id, newToDo) => this.model.editToDo(id, newToDo);
  handleDeleteTodo = (id) => this.model.deleteToDo(id);
  handleToggleTodo = (id) => this.model.toggleToDo(id);
}

const app = new Controller(new Model(), new View());
