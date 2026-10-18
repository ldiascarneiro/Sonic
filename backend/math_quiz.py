"""Reconhecimento e sequências até 50; apenas somas com resultado até 10."""
import random


def question(seed: int, step: int, kind: int) -> tuple[str, int, list[int], dict]:
    rng = random.Random(f'{seed}:{step}:preschool-v3')
    category = ('recognition', 'sequence', 'addition', 'recognition', 'sequence')[kind]
    limit = 50
    if category == 'addition':
        left = rng.randint(1, 9)
        right = rng.randint(1, 10 - left)
        answer = left + right
        prompt = f'Quanto é {left} mais {right}?'
        visual = {'exercise': category, 'addends': [left, right], 'speech': prompt}
        limit = 10
    elif category == 'recognition':
        answer = rng.randint(1, 50)
        prompt = 'Toque no número igual ao modelo.'
        visual = {'exercise': category, 'model_number': answer,
                  'speech': f'Este é o número {answer}. Toque no número {answer}.'}
    else:
        first = rng.randint(1, 48)
        gap = rng.randrange(3)
        sequence = [first + i if i != gap else None for i in range(3)]
        answer = first + gap
        prompt = 'Qual número está faltando?'
        spoken = ', '.join('número faltando' if n is None else str(n) for n in sequence)
        visual = {'exercise': category, 'sequence': sequence,
                  'speech': f'Complete a sequência: {spoken}. Qual número está faltando?'}
    others = sorted({answer + delta for delta in (-10, -2, -1, 1, 2, 10)
                     if 1 <= answer + delta <= limit})
    return prompt, answer, [answer, *rng.sample(others, 2)], visual
