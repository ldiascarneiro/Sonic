"""Regras pedagógicas, independentes da interface e de HTTP."""
import secrets
import random
from typing import Literal

from itsdangerous import URLSafeTimedSerializer
from shared.catalog import MODES
from backend.math_quiz import question

Mode = Literal['numbers', 'colors', 'shapes', 'mixed']
COLORS = [('blue', 'azul'), ('yellow', 'amarelo'), ('red', 'vermelho')]
SHAPES = [('circle', 'círculo'), ('square', 'quadrado'), ('triangle', 'triângulo')]


class Game:
    def __init__(self, key: str):
        self.signer = URLSafeTimedSerializer(key, salt='sonic-learning-preschool-v3')

    def start(self, mode: Mode) -> dict:
        order = list(range(5))
        secrets.SystemRandom().shuffle(order)
        return self.view({'mode': mode, 'step': 0, 'order': order, 'seed': secrets.randbits(64)})

    def view(self, state: dict, feedback: str = '') -> dict:
        mode, step = state['mode'], state['step']
        complete = step >= 5
        result = {'token': self.signer.dumps(state), 'mode': mode, 'step': step,
                  'total': 5, 'complete': complete, 'feedback': feedback, 'options': [],
                  'title': MODES[mode]['title'], 'curriculum': 'preschool-v3'}
        if complete:
            result['prompt'] = 'Você conseguiu! Que tal descansar um pouquinho?'
            return result
        target = state['order'][step]
        topic = ['numbers', 'colors', 'shapes', 'numbers', 'colors'][step] if mode == 'mixed' else mode
        result['topic'] = topic
        # Mantém escolhas e posições estáveis durante novas tentativas.
        rng = random.Random(f"{mode}:{state['order']}:{step}")
        if topic == 'numbers':
            result['prompt'], _, choices, visual = question(state['seed'], step, target)
            result.update(visual)
            options = [{'value': str(n), 'label': str(n), 'kind': 'number'} for n in choices]
        else:
            items = COLORS if topic == 'colors' else SHAPES
            _, label = items[target % 3]
            result['prompt'] = f'Encontre a cor {label}!' if topic == 'colors' else f'Encontre o {label}!'
            options = [{'value': code, 'label': name, 'kind': topic} for code, name in items]
        rng.shuffle(options)
        result['options'] = options
        return result

    def answer(self, token: str, choice: str) -> dict:
        state = self.signer.loads(token, max_age=1800)
        if state['step'] >= 5:
            return self.view(state)
        target = state['order'][state['step']]
        mode = state['mode']
        if mode == 'mixed':
            mode = ['numbers', 'colors', 'shapes', 'numbers', 'colors'][state['step']]
        correct = str(target + 1) if mode == 'numbers' else (COLORS if mode == 'colors' else SHAPES)[target % 3][0]
        if mode == 'numbers' and 'seed' in state:
            correct = str(question(state['seed'], state['step'], target)[1])
        if choice == correct:
            state['step'] += 1
            return self.view(state, 'Isso mesmo! Vamos juntos!')
        return self.view(state, 'Vamos olhar com carinho e tentar de novo!')
