import pytest
import re
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from backend.game import Game


def correct_choice(game, result):
    if result['exercise'] == 'recognition':
        return str(result['model_number'])
    if result['exercise'] == 'addition':
        return str(sum(result['addends']))
    if result['exercise'] == 'counting':
        return str(result['ring_count'])
    sequence = result['sequence']
    position, value = next((i, n) for i, n in enumerate(sequence) if n is not None)
    return str(value - position + sequence.index(None))


@pytest.mark.parametrize('mode', ['numbers'])
def test_full_adventure_and_gentle_retry(mode):
    game = Game('test-key')
    result = game.start(mode)
    exercises = set()
    for step in range(5):
        exercises.add(result['exercise'])
        assert result['step'] == step
        correct = correct_choice(game, result)
        assert correct in [o['value'] for o in result['options']]
        wrong = next(o['value'] for o in result['options'] if o['value'] != correct)
        retry = game.answer(result['token'], wrong)
        assert retry['step'] == step
        assert retry['options'] == result['options']
        assert retry['feedback']
        result = game.answer(retry['token'], correct)
    assert exercises == {'addition', 'sequence', 'recognition', 'counting'}
    assert result['complete'] and not result['options']
    assert game.answer(result['token'], '1')['step'] == 5


def test_tampered_token_rejected():
    game = Game('test-key')
    token = game.start('numbers')['token']
    with pytest.raises(BadSignature):
        game.answer(token + 'tampered', '1')


def test_math_range_correctness_and_stable_retries():
    game = Game('test-key')
    seen = set()
    for seed in range(100):
        for kind in range(5):
            result = game.view({'mode': 'numbers', 'step': kind, 'order': list(range(5)), 'seed': seed})
            choices = [int(o['value']) for o in result['options']]
            assert len(set(choices)) == 3
            limit = 10 if result['exercise'] in {'addition', 'counting'} else 50
            assert all(1 <= n <= limit for n in choices)
            assert result['exercise'] in {'addition', 'recognition', 'sequence', 'counting'}
            if result['exercise'] == 'addition':
                assert 2 <= sum(result['addends']) <= 10
                assert all(1 <= n <= 9 for n in result['addends'])
            elif result['exercise'] == 'recognition':
                assert 1 <= result['model_number'] <= 50
                assert str(result['model_number']) in result['speech']
            elif result['exercise'] == 'counting':
                assert 1 <= result['ring_count'] <= 10
                assert not re.search(r'\d', result['speech'])
            else:
                assert result['sequence'].count(None) == 1
                assert all(n is None or 1 <= n <= 50 for n in result['sequence'])
            seen.update(choices)
            correct = correct_choice(game, result)
            assert int(correct) in choices
            assert game.answer(result['token'], correct)['step'] == kind + 1
            wrong = next(o['value'] for o in result['options'] if o['value'] != correct)
            retry = game.answer(result['token'], wrong)
            assert retry['step'] == kind
            assert (retry['prompt'], retry['options']) == (result['prompt'], result['options'])
            assert 'answer' not in result
    assert 50 in seen and 1 in seen


def test_old_curriculum_tokens_cannot_reintroduce_harder_questions():
    game = Game('test-key')
    token = URLSafeTimedSerializer('test-key', salt='sonic-learning-preschool-v3').dumps(
        {'mode': 'numbers', 'step': 0, 'order': list(range(5)), 'seed': 42})
    with pytest.raises(BadSignature):
        game.answer(token, '1')


def test_expired_token_rejected(monkeypatch):
    game = Game('test-key')
    monkeypatch.setattr('itsdangerous.timed.TimestampSigner.get_timestamp', lambda self: 1000)
    token = game.start('numbers')['token']
    monkeypatch.setattr('itsdangerous.timed.TimestampSigner.get_timestamp', lambda self: 2801)
    with pytest.raises(SignatureExpired):
        game.answer(token, '1')
